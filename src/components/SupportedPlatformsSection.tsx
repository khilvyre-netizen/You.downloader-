import React from 'react';
import { Video, Music, Globe, Smartphone, ShieldCheck, Film } from 'lucide-react';

export const SupportedPlatformsSection: React.FC = () => {
  const platforms = [
    {
      name: 'Dailymotion',
      category: 'Video Hosting',
      quality: 'Up to 1080p HD',
      desc: 'Fast extraction of news, interviews, sports, and music videos.',
    },
    {
      name: 'Archive.org',
      category: 'Public Domain',
      quality: 'Original Resolution',
      desc: 'Thousands of historic animations, public domain films, and archives.',
    },
    {
      name: 'YouTube',
      category: 'Video Platform',
      quality: '1080p / 720p / MP3',
      desc: 'Permitted personal videos, Creative Commons licenses, and audio.',
    },
    {
      name: 'TikTok',
      category: 'Short Video',
      quality: 'HD MP4',
      desc: 'Mobile short videos, viral clips, and sound audio extraction.',
    },
    {
      name: 'Twitter / X',
      category: 'Social Media',
      quality: '720p / 1080p',
      desc: 'Media attachments, commentary clips, and public video broadcasts.',
    },
    {
      name: 'Reddit',
      category: 'Community',
      quality: 'Auto-Merged Audio',
      desc: 'Combines Reddit video and audio streams seamlessly using FFmpeg.',
    },
    {
      name: 'Vimeo',
      category: 'Creative Hub',
      quality: 'Up to 1080p',
      desc: 'Public showcase films, design reels, and indie creator media.',
    },
    {
      name: 'Direct Media Links',
      category: 'Web URLs',
      quality: 'Original MP4 / WebM',
      desc: 'Direct links ending in .mp4, .webm, .mov, or raw web media streams.',
    },
  ];

  return (
    <section id="supported-platforms" className="py-16 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Supported Sources & Formats
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Powered by modern media extraction engines, OmniRip supports major video portals and direct media endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((p, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-semibold text-white text-sm sm:text-base">{p.name}</h3>
                <span className="text-[11px] font-medium text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-900/50">
                  {p.quality}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-medium">
                {p.category}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start sm:items-center gap-3 max-w-3xl mx-auto">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
          <p>
            <strong>Important note:</strong> Only download videos you own, copyright-free content (Creative Commons), or media you have explicit permission to download. Geo-locked or login-walled content cannot be fetched.
          </p>
        </div>
      </div>
    </section>
  );
};
