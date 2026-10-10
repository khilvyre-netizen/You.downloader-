import React, { useState } from 'react';
import { DownloadCloud, Menu, X, Shield, FileText, HelpCircle, CheckCircle2, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenSettings: () => void;
  onScrollToSection: (sectionId: string) => void;
  onQuickPaste: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenSettings,
  onScrollToSection,
  onQuickPaste,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('top')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              OmniRip
              <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-1.5 py-0.5 rounded-md">
                Fast
              </span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick('top')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Downloader
          </button>
          <button
            onClick={() => handleNavClick('supported-platforms')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Supported Sites
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('faq')}
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
            Terms
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
            title="Backend Server Settings"
            aria-label="Server Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onQuickPaste}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Read link directly from clipboard"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            Paste Link
          </button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 focus:outline-none cursor-pointer"
            aria-label="Server Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2">
          <button
            onClick={() => handleNavClick('top')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            Downloader
          </button>
          <button
            onClick={() => handleNavClick('supported-platforms')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            Supported Platforms
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Frequently Asked Questions
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSettings();
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Backend Server Settings
          </button>
          <div className="border-t border-slate-800 pt-2 mt-2 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPrivacy();
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-slate-200 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTerms();
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-slate-200 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
