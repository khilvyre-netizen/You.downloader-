import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { UrlInputSection } from './components/UrlInputSection';
import { VideoPreviewCard } from './components/VideoPreviewCard';
import { DownloadProgressModal } from './components/DownloadProgressModal';
import { SupportedPlatformsSection } from './components/SupportedPlatformsSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { FaqSection } from './components/FaqSection';
import { PrivacyModal } from './components/PrivacyModal';
import { TermsModal } from './components/TermsModal';
import { Footer } from './components/Footer';
import { VideoMetadata, DownloadJobStatus, SampleItem } from './types';

export default function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [downloadJob, setDownloadJob] = useState<DownloadJobStatus | null>(null);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [samples, setSamples] = useState<SampleItem[]>([
    {
      title: 'Popeye Cartoon (Archive.org)',
      url: 'https://archive.org/details/Popeye_forPresident',
      type: 'Animation · Public Domain',
    },
    {
      title: 'Dailymotion News Clip',
      url: 'https://www.dailymotion.com/video/x8ogg7i',
      type: 'Dailymotion Video',
    },
    {
      title: '1920 Silent Film Classic',
      url: 'https://archive.org/details/silent_movie_1920',
      type: 'Archive.org Classic',
    },
  ]);

  const pollIntervalRef = useRef<any>(null);

  // Fetch sample links and server metadata on load
  useEffect(() => {
    fetch('/api/info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.samples?.length) {
          setSamples(data.samples);
        }
      })
      .catch(() => {
        // Fallback samples already configured
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Poll active download job
  useEffect(() => {
    if (
      downloadJob &&
      (downloadJob.status === 'downloading' ||
        downloadJob.status === 'converting' ||
        downloadJob.status === 'queued')
    ) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/status/${downloadJob.id}`);
          if (res.ok) {
            const data: DownloadJobStatus = await res.json();
            setDownloadJob(data);
            if (data.status === 'ready' || data.status === 'error') {
              clearInterval(pollIntervalRef.current);
            }
          } else {
            clearInterval(pollIntervalRef.current);
          }
        } catch (err) {
          console.error('Status poll error:', err);
        }
      }, 1000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [downloadJob?.id, downloadJob?.status]);

  // Analyze URL handler
  const handleAnalyze = async (targetUrl?: string) => {
    const inputUrl = (targetUrl || url).trim();
    if (!inputUrl) {
      setError('Please enter or paste a valid video URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "We couldn't process this URL. Please check the link and try again.");
      }

      setMetadata(data);
      // Smooth scroll to preview
      setTimeout(() => {
        const previewElement = document.getElementById('video-preview');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || "We couldn't process this URL. Please check the link and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start Download handler
  const handleStartDownload = async (params: {
    formatId: string;
    formatType: 'video' | 'audio';
    quality: string;
    outputFormat: 'mp4' | 'webm' | 'mp3' | 'm4a';
  }) => {
    if (!metadata) return;

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: metadata.webpageUrl,
          formatId: params.formatId,
          formatType: params.formatType,
          quality: params.quality,
          outputFormat: params.outputFormat,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start download job.');
      }

      setDownloadJob({
        id: data.jobId,
        status: 'downloading',
        progress: 5,
        targetExt: params.outputFormat,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to initialize download.');
    }
  };

  // Cancel Job handler
  const handleCancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/cleanup/${jobId}`, { method: 'POST' });
    } catch {}
    setDownloadJob(null);
  };

  // Clipboard Paste handler
  const handlePasteClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        showToast('Clipboard access not permitted in this browser');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text && text.trim().startsWith('http')) {
        setUrl(text.trim());
        showToast('Pasted link from clipboard');
        handleAnalyze(text.trim());
      } else if (text) {
        setUrl(text.trim());
        showToast('Pasted text from clipboard');
      } else {
        showToast('Clipboard is empty');
      }
    } catch (err) {
      showToast('Could not read clipboard. Please paste manually.');
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    handleAnalyze(sampleUrl);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/60 shadow-xl text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <Header
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onScrollToSection={handleScrollToSection}
        onQuickPaste={handlePasteClipboard}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <UrlInputSection
          url={url}
          setUrl={setUrl}
          onAnalyze={() => handleAnalyze()}
          isLoading={isLoading}
          error={error}
          samples={samples}
          onSelectSample={handleSelectSample}
          onPasteClipboard={handlePasteClipboard}
        />

        {/* Video Preview Card with Smooth Layout Transition */}
        <AnimatePresence mode="wait">
          {metadata && (
            <motion.div
              key={metadata.id || metadata.webpageUrl}
              id="video-preview"
              layout
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.25 } }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              <VideoPreviewCard
                metadata={metadata}
                onStartDownload={handleStartDownload}
                onClear={() => setMetadata(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informative Sections with smooth layout adjustment */}
        <motion.div layout transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          <HowItWorksSection />
          <SupportedPlatformsSection />
          <FeaturesSection />
          <FaqSection />
        </motion.div>
      </main>

      {/* Download Progress & Ready Modal */}
      <DownloadProgressModal
        job={downloadJob}
        onClose={() => setDownloadJob(null)}
        onCancelJob={handleCancelJob}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Terms of Service Modal */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onScrollToSection={handleScrollToSection}
      />
    </div>
  );
}
