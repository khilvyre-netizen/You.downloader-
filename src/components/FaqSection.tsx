import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I download videos to an iPhone or iPad?',
      a: 'On iOS 13+, open Safari, paste the video link, analyze it, and tap "Download". Safari will display a pop-up asking if you want to download the file. Tap "Download". Once completed, tap the blue arrow download icon in the Safari address bar, tap the downloaded video, tap the Share icon, and select "Save Video" to save it directly into your Photos camera roll.',
    },
    {
      q: 'How do I download videos on an Android smartphone?',
      a: 'On Android (Chrome, Firefox, or Brave), simply paste the URL, select your quality, and tap "Download". The browser will download the MP4 or MP3 file directly into your device\'s "Downloads" folder, accessible through any Files app or Gallery.',
    },
    {
      q: 'Why did my video URL fail or say "Video unavailable"?',
      a: 'Some platforms enforce anti-scraping measures against cloud data centers, require a logged-in user account, or host private/geo-blocked videos. Additionally, live streams and videos exceeding 2 hours in duration are restricted to protect server stability.',
    },
    {
      q: 'Which video and audio formats are supported?',
      a: 'OmniRip supports MP4 and WEBM containers for video (up to 1080p Full HD where available from the host) and MP3 (up to 320kbps) as well as M4A for audio tracks.',
    },
    {
      q: 'How long are downloaded files stored on your server?',
      a: 'We operate under a strict zero-retention policy. Files are stored only in temporary RAM/disk buffers during conversion and are automatically purged within 60 seconds after download or after a maximum 15-minute TTL cleanup interval.',
    },
    {
      q: 'Can I download copyrighted content?',
      a: 'No. OmniRip is designed solely for content that you own, media that you have explicit permission to download, or works distributed under Creative Commons and public domain licenses. Users are responsible for complying with the copyright terms of the source content.',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 border-t border-slate-900 bg-slate-950/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Everything you need to know about formats, mobile saving, and security.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-200">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-850 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
