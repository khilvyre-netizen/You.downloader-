import express, { Request, Response, NextFunction } from 'express';
import { spawn, execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure download directories exist
const DOWNLOAD_BASE_DIR = path.join(os.tmpdir(), 'omnirip_downloads');
if (!fs.existsSync(DOWNLOAD_BASE_DIR)) {
  fs.mkdirSync(DOWNLOAD_BASE_DIR, { recursive: true });
}

// Find yt-dlp executable path
const YT_DLP_PATH = path.resolve(__dirname, 'bin', 'yt-dlp');
if (!fs.existsSync(YT_DLP_PATH)) {
  console.warn(`yt-dlp binary not found at ${YT_DLP_PATH}. Downloads will fall back to system binaries if available.`);
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory rate limiter: max 30 requests per IP per minute
interface RateRecord {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateRecord>();

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReqs = 40;

  const record = rateLimits.get(ip);
  if (!record || now > record.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (record.count >= maxReqs) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute before analyzing or downloading more videos.'
    });
  }

  record.count++;
  next();
};

// SSRF and URL validation helper
function validateVideoUrl(rawUrl: string): { valid: boolean; error?: string; parsed?: URL } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'A valid URL is required.' };
  }

  const trimmed = rawUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'The provided link is not a valid URL. Example: https://vimeo.com/... or https://dailymotion.com/video/...' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS links are supported.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF checks
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('169.254.') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal' ||
    hostname === '[::1]'
  ) {
    return { valid: false, error: 'Private or local network addresses cannot be accessed.' };
  }

  // Check private 172.16.0.0 - 172.31.255.255
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) {
    return { valid: false, error: 'Internal private IPs are not allowed.' };
  }

  return { valid: true, parsed };
}

// In-memory Download Job Tracking
export interface DownloadJob {
  id: string;
  url: string;
  formatType: 'video' | 'audio';
  quality: string;
  targetExt: string;
  status: 'queued' | 'downloading' | 'converting' | 'ready' | 'error';
  progress: number;
  speed?: string;
  eta?: string;
  downloadedBytes?: number;
  totalBytes?: number;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  createdAt: number;
  process?: any;
}

const activeJobs = new Map<string, DownloadJob>();

// Cleanup stale files and jobs older than 15 minutes
function cleanupOldJobs() {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [id, job] of activeJobs.entries()) {
    if (job.createdAt < cutoff) {
      if (job.filePath && fs.existsSync(job.filePath)) {
        try {
          fs.unlinkSync(job.filePath);
          const dir = path.dirname(job.filePath);
          if (fs.existsSync(dir) && dir !== DOWNLOAD_BASE_DIR) {
            fs.rmSync(dir, { recursive: true, force: true });
          }
        } catch (e) {
          console.error(`Failed to delete temp file for job ${id}:`, e);
        }
      }
      activeJobs.delete(id);
    }
  }
}
setInterval(cleanupOldJobs, 3 * 60 * 1000);

// API: Analyze Video
app.post('/api/analyze', rateLimiter, async (req: Request, res: Response) => {
  const { url } = req.body;
  const validation = validateVideoUrl(url);

  if (!validation.valid || !validation.parsed) {
    return res.status(400).json({ error: validation.error || 'Invalid URL' });
  }

  const cleanUrl = validation.parsed.href;

  const ytDlpCmd = fs.existsSync(YT_DLP_PATH) ? YT_DLP_PATH : 'yt-dlp';

  const args = [
    '--dump-json',
    '--no-warnings',
    '--no-playlist',
    '--no-check-certificates',
    '--socket-timeout', '20',
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    cleanUrl
  ];

  execFile(ytDlpCmd, args, { maxBuffer: 15 * 1024 * 1024, timeout: 25000 }, (err, stdout, stderr) => {
    if (err) {
      const errStr = (stderr || err.message || '').toString();

      // Check common friendly error messages
      if (errStr.includes('Sign in to confirm') || errStr.includes('bot')) {
        return res.status(403).json({
          error: 'This platform requires authentication or blocks automated requests from cloud servers. Please try a public video from Dailymotion, Archive.org, or direct MP4/WebM URL.',
          technical: errStr.slice(0, 300)
        });
      }
      if (errStr.includes('Video unavailable') || errStr.includes('Private video') || errStr.includes('404')) {
        return res.status(404).json({
          error: 'The requested video was not found, is set to private, or has been removed.',
          technical: errStr.slice(0, 300)
        });
      }
      if (errStr.includes('Unsupported URL') || errStr.includes('No video formats found')) {
        return res.status(400).json({
          error: 'Unsupported platform or no downloadable media found at this URL.',
          technical: errStr.slice(0, 300)
        });
      }
      return res.status(500).json({
        error: "We couldn't process this URL. Please check the link and verify it is publicly accessible.",
        technical: errStr.slice(0, 300)
      });
    }

    try {
      // Find the JSON block in stdout (accounting for deprecation notices)
      const jsonStart = stdout.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No valid JSON metadata returned by extractor');
      }
      const rawJson = stdout.slice(jsonStart);
      const data = JSON.parse(rawJson);

      const duration = data.duration || 0;
      // Max duration limit check: 2 hours (7200s)
      if (duration > 7200) {
        return res.status(400).json({
          error: 'Video exceeds the maximum duration limit of 2 hours (120 minutes) to prevent server overload.'
        });
      }

      // Format processing
      const rawFormats = Array.isArray(data.formats) ? data.formats : [];
      
      // Video options
      const videoOptions: Array<{
        formatId: string;
        label: string;
        resolution: string;
        height: number;
        ext: string;
        filesize?: number;
        hasAudio: boolean;
      }> = [];

      // Audio options
      const audioOptions: Array<{
        formatId: string;
        label: string;
        ext: string;
        abr?: number;
        filesize?: number;
      }> = [];

      // Add smart defaults
      videoOptions.push({
        formatId: 'best',
        label: 'Best Available (Auto)',
        resolution: 'Original',
        height: 1080,
        ext: 'mp4',
        hasAudio: true,
      });

      const heightsFound = new Set<number>();

      for (const f of rawFormats) {
        const h = f.height;
        const vcodec = f.vcodec || '';
        const acodec = f.acodec || '';
        const ext = f.ext || 'mp4';
        const isVideo = vcodec !== 'none' && h;
        const isAudio = acodec !== 'none' && vcodec === 'none';

        if (isVideo && h && !heightsFound.has(h)) {
          heightsFound.add(h);
          videoOptions.push({
            formatId: f.format_id,
            label: `${h}p ${h >= 720 ? 'HD' : 'SD'} (${ext.toUpperCase()})`,
            resolution: `${h}p`,
            height: h,
            ext: ext,
            filesize: f.filesize || f.filesize_approx,
            hasAudio: acodec !== 'none',
          });
        }

        if (isAudio && (ext === 'm4a' || ext === 'mp3' || ext === 'webm')) {
          audioOptions.push({
            formatId: f.format_id,
            label: `${Math.round(f.abr || 128)} kbps (${ext.toUpperCase()})`,
            ext: ext,
            abr: f.abr,
            filesize: f.filesize || f.filesize_approx,
          });
        }
      }

      // Add high quality MP3 conversion preset
      audioOptions.unshift({
        formatId: 'bestaudio-mp3',
        label: 'High Quality MP3 (320kbps Audio)',
        ext: 'mp3',
        abr: 320,
      });

      // Sort video options descending by height
      videoOptions.sort((a, b) => (b.height || 0) - (a.height || 0));

      const metadata = {
        id: data.id || crypto.randomUUID().slice(0, 8),
        title: data.title || 'Untitled Video',
        description: data.description ? data.description.slice(0, 300) : '',
        thumbnail: data.thumbnail || (Array.isArray(data.thumbnails) && data.thumbnails.length ? data.thumbnails[data.thumbnails.length - 1].url : null),
        duration: duration,
        uploader: data.uploader || data.channel || 'Unknown Creator',
        uploaderUrl: data.uploader_url || data.channel_url || null,
        extractor: data.extractor_key || data.extractor || 'Web Source',
        webpageUrl: cleanUrl,
        videoOptions,
        audioOptions,
      };

      res.json(metadata);
    } catch (parseErr: any) {
      console.error('Error parsing yt-dlp metadata:', parseErr);
      res.status(500).json({
        error: 'Failed to extract video format details. Please verify the URL is accessible.',
        details: parseErr.message
      });
    }
  });
});

// API: Start Download Job
app.post('/api/download', rateLimiter, (req: Request, res: Response) => {
  const { url, formatId, formatType = 'video', quality = 'best', outputFormat } = req.body;
  const validation = validateVideoUrl(url);

  if (!validation.valid || !validation.parsed) {
    return res.status(400).json({ error: validation.error || 'Invalid URL' });
  }

  const jobId = crypto.randomUUID();
  const jobDir = path.join(DOWNLOAD_BASE_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const isAudioOnly = formatType === 'audio' || formatId === 'bestaudio-mp3';
  const targetExt = isAudioOnly ? (outputFormat || 'mp3') : (outputFormat || 'mp4');

  const outputTemplate = path.join(jobDir, `video_${jobId}.%(ext)s`);

  const ytDlpCmd = fs.existsSync(YT_DLP_PATH) ? YT_DLP_PATH : 'yt-dlp';

  const args: string[] = [
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--max-filesize', '500M',
    '--socket-timeout', '30',
    '-o', outputTemplate,
    '--newline', // Output progress on new lines for easy parsing
  ];

  if (isAudioOnly) {
    args.push('-x');
    args.push('--audio-format', targetExt === 'mp3' ? 'mp3' : 'm4a');
    args.push('--audio-quality', '0'); // Highest quality audio
    if (formatId && formatId !== 'bestaudio-mp3') {
      args.push('-f', formatId);
    } else {
      args.push('-f', 'bestaudio/best');
    }
  } else {
    // Video format selection
    if (formatId && formatId !== 'best') {
      // Merge best audio if video format is video-only
      args.push('-f', `${formatId}+bestaudio/best`);
      args.push('--merge-output-format', targetExt);
    } else {
      args.push('-f', 'bestvideo+bestaudio/best');
      args.push('--merge-output-format', targetExt);
    }
  }

  args.push(validation.parsed.href);

  const job: DownloadJob = {
    id: jobId,
    url: validation.parsed.href,
    formatType: isAudioOnly ? 'audio' : 'video',
    quality,
    targetExt,
    status: 'downloading',
    progress: 5,
    createdAt: Date.now(),
  };

  activeJobs.set(jobId, job);

  console.log(`Starting job ${jobId}: ${ytDlpCmd} ${args.join(' ')}`);

  const child = spawn(ytDlpCmd, args);
  job.process = child;

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    // Parse progress: [download]  45.3% of ~  12.50MiB at    4.20MiB/s ETA 00:02
    const downloadMatch = text.match(/\[download\]\s+([\d.]+)%\s+of\s+~?([\d.]+\w+)?\s+at\s+([\d.]+\w+\/s)?\s+ETA\s+([\d:]+)?/);
    if (downloadMatch) {
      const pct = parseFloat(downloadMatch[1]);
      if (!isNaN(pct)) {
        job.progress = Math.min(95, Math.max(5, Math.round(pct)));
      }
      if (downloadMatch[3]) job.speed = downloadMatch[3].trim();
      if (downloadMatch[4]) job.eta = downloadMatch[4].trim();
    } else if (text.includes('[ExtractAudio]') || text.includes('[Merger]')) {
      job.status = 'converting';
      job.progress = 92;
    }
  });

  child.stderr.on('data', (chunk) => {
    const errText = chunk.toString();
    console.warn(`[Job ${jobId} stderr]:`, errText);
    if (errText.includes('File is larger than max-filesize')) {
      job.error = 'File exceeds maximum size limit (500MB).';
    }
  });

  child.on('close', (code) => {
    delete job.process;
    if (code === 0) {
      // Find the generated file in jobDir
      try {
        const files = fs.readdirSync(jobDir);
        if (files.length > 0) {
          const mainFile = files[0];
          const fullPath = path.join(jobDir, mainFile);
          const stats = fs.statSync(fullPath);
          job.filePath = fullPath;
          job.fileName = mainFile;
          job.fileSize = stats.size;
          job.status = 'ready';
          job.progress = 100;
        } else {
          job.status = 'error';
          job.error = job.error || 'Output file was not produced.';
        }
      } catch (e: any) {
        job.status = 'error';
        job.error = e.message;
      }
    } else {
      job.status = 'error';
      job.error = job.error || 'Download failed or was aborted by the host server.';
    }
  });

  res.json({ jobId, status: 'downloading', message: 'Download initiated.' });
});

// API: Get Job Status
app.get('/api/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found or has expired.' });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    speed: job.speed,
    eta: job.eta,
    fileName: job.fileName,
    fileSize: job.fileSize,
    targetExt: job.targetExt,
    error: job.error,
    readyUrl: job.status === 'ready' ? `/api/file/${job.id}` : null,
  });
});

// API: Download the Prepared File
app.get('/api/file/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job || job.status !== 'ready' || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).json({ error: 'File is not ready or has been deleted.' });
  }

  const cleanFileName = `OmniRip_${job.id.slice(0, 8)}.${job.targetExt}`;

  res.download(job.filePath, cleanFileName, (err) => {
    if (err) {
      console.error(`Error sending file ${job.filePath}:`, err);
    }
    // Automatically delete after 60 seconds following download completion
    setTimeout(() => {
      try {
        if (job.filePath && fs.existsSync(job.filePath)) {
          fs.unlinkSync(job.filePath);
          const dir = path.dirname(job.filePath);
          if (fs.existsSync(dir) && dir !== DOWNLOAD_BASE_DIR) {
            fs.rmSync(dir, { recursive: true, force: true });
          }
          activeJobs.delete(jobId);
          console.log(`Cleaned up temp files for job ${jobId}`);
        }
      } catch (cleanupErr) {
        console.error(`Error in post-download cleanup for ${jobId}:`, cleanupErr);
      }
    }, 60 * 1000);
  });
});

// API: Cancel / Delete Job
app.post('/api/cleanup/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (job) {
    if (job.process) {
      try {
        job.process.kill();
      } catch {}
    }
    if (job.filePath && fs.existsSync(job.filePath)) {
      try {
        fs.unlinkSync(job.filePath);
        const dir = path.dirname(job.filePath);
        if (fs.existsSync(dir) && dir !== DOWNLOAD_BASE_DIR) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {}
    }
    activeJobs.delete(jobId);
  }

  res.json({ success: true });
});

// API: Supported Platforms and Sample Links
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    service: 'OmniRip Video & Audio Downloader',
    maxDurationMinutes: 120,
    maxFileSizeMb: 500,
    samples: [
      {
        title: 'Archive.org Animation (Public Domain)',
        url: 'https://archive.org/details/Popeye_forPresident',
        type: 'Animation · Public Domain',
      },
      {
        title: 'Dailymotion News Clip',
        url: 'https://www.dailymotion.com/video/x8ogg7i',
        type: 'Dailymotion Clip',
      },
      {
        title: 'Internet Archive Silent Film',
        url: 'https://archive.org/details/silent_movie_1920',
        type: 'Silent Classic · Archive.org',
      }
    ],
    supportedPlatforms: [
      { name: 'YouTube', note: 'Permitted content & CC' },
      { name: 'Dailymotion', note: 'Full HD & SD' },
      { name: 'Archive.org', note: 'Public Domain Movies' },
      { name: 'TikTok', note: 'Short-form videos' },
      { name: 'Twitter / X', note: 'Media & clips' },
      { name: 'Reddit', note: 'Native video & audio' },
      { name: 'Vimeo', note: 'Public creative videos' },
      { name: 'SoundCloud', note: 'MP3 audio tracks' },
      { name: 'Direct MP4 / WebM', note: 'Direct video URLs' },
    ]
  });
});

// Vite middleware integration for full-stack dev / prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
