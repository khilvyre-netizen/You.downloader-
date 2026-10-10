import React from 'react';
import { DownloadCloud, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onScrollToSection,
}) => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 pt-12 pb-16 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <DownloadCloud className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white tracking-tight text-base">OmniRip</span>
            </div>
            <p className="text-xs text-slate-400">
              Fast, simple & mobile-friendly social video and audio downloader.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <button
              onClick={() => onScrollToSection('top')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Downloader
            </button>
            <button
              onClick={() => onScrollToSection('supported-platforms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Supported Sites
            </button>
            <button
              onClick={() => onScrollToSection('how-it-works')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => onScrollToSection('faq')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OmniRip. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Designed strictly for personal, permitted, and open-license content. No files permanently hosted.
          </p>
        </div>
      </div>
    </footer>
  );
};
