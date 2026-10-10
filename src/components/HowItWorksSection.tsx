import React from 'react';
import { Link2, Sliders, ArrowDownCircle } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Link2,
      title: 'Paste the Video Link',
      desc: 'Copy the URL of the video or audio clip from your browser, TikTok, Reddit, or social app and paste it into the search box.',
    },
    {
      num: '02',
      icon: Sliders,
      title: 'Analyze & Choose Quality',
      desc: 'Click Analyze to inspect available streams. Select your preferred resolution (1080p, 720p, 480p) or extract clean 320kbps MP3 audio.',
    },
    {
      num: '03',
      icon: ArrowDownCircle,
      title: 'Download & Auto-Purge',
      desc: 'Our server merges audio and video using FFmpeg and provides a direct download link. Temporary files are automatically deleted after download.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 border-t border-slate-900 bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            No registration, no software installations, and zero unnecessary steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-2xl font-extrabold text-slate-700 tabular-nums">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
