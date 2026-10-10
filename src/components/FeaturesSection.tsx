import React from 'react';
import { Zap, ShieldCheck, Music2, Smartphone, HardDriveDownload, Sparkles } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'High-Speed Processing',
      desc: 'Native server-side FFmpeg pipeline delivers rapid format parsing and audio-video stream merging.',
    },
    {
      icon: ShieldCheck,
      title: 'Auto-Cleanup & Privacy',
      desc: 'All downloaded files are purged automatically from temporary storage immediately after download or within 15 minutes.',
    },
    {
      icon: Music2,
      title: 'Audio MP3 Extraction',
      desc: 'Need just the soundtrack? Extract high-bitrate MP3 or M4A audio files directly from video clips with one click.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Responsive',
      desc: 'Optimized touch targets, streamlined thumb-zone interactions, and full support for iOS Files and Android downloads.',
    },
    {
      icon: HardDriveDownload,
      title: 'Multiple Resolutions',
      desc: 'Choose from 1080p Full HD down to lightweight 360p or 480p SD for low-bandwidth mobile streaming.',
    },
    {
      icon: Sparkles,
      title: 'Zero Accounts Required',
      desc: 'No login, no tracking cookies, and no personal data collection. Instant utility when you need it.',
    },
  ];

  return (
    <section className="py-16 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Engineered for Speed & Simplicity
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A lightweight, secure utility designed to save personal and permitted media efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-3.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
