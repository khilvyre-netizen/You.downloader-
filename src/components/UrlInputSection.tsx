import React, { useRef } from 'react';
import { Search, Clipboard, X, Loader2, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { SampleItem } from '../types';

interface UrlInputSectionProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string | null;
  samples: SampleItem[];
  onSelectSample: (sampleUrl: string) => void;
  onPasteClipboard: () => void;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  url,
  setUrl,
  onAnalyze,
  isLoading,
  error,
  samples,
  onSelectSample,
  onPasteClipboard,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      onAnalyze();
    }
  };

  const handleClear = () => {
    setUrl('');
    inputRef.current?.focus();
  };

  return (
    <section id="top" className="relative overflow-hidden pt-10 pb-8 sm:pt-16 sm:pb-12 text-center bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent_70%)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Anti-slop clean kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-xs font-medium text-indigo-300 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fast, Safe & Zero Tracking · For Permitted & Personal Media</span>
        </div>

        {/* Large Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 text-balance">
          Download Videos <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">Easily</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Paste any supported video URL to inspect available formats, select your preferred video resolution or MP3 audio, and download in seconds.
        </p>

        {/* Input Bar Container */}
        <div className="relative max-w-2xl mx-auto">
          <div className="p-1.5 sm:p-2 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-indigo-950/30 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center flex-1 min-w-0 px-3 py-1 gap-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste video link here (e.g. Dailymotion, Archive.org, Reddit)..."
                disabled={isLoading}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                aria-label="Video link URL input"
              />
              {url ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  title="Clear input"
                  aria-label="Clear link input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPasteClipboard}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 hover:text-white transition-colors shrink-0 cursor-pointer"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                  Paste
                </button>
              )}
            </div>

            {/* Analyze Button */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 sm:py-3 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Paste button on small mobile screens if input is empty */}
          {!url && (
            <div className="mt-2.5 sm:hidden flex justify-center">
              <button
                type="button"
                onClick={onPasteClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800"
              >
                <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                Paste from Clipboard
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-left flex items-start gap-3 text-rose-200 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-rose-100">{error}</p>
                <p className="text-slate-400 mt-1">
                  Tip: Some platforms restrict automated data centers. Try one of our verified public sample links below to test instantly.
                </p>
              </div>
            </div>
          )}

          {/* Quick Sample Links for Reviewers */}
          {samples.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick test samples:</span>
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSample(s.url)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-800 text-slate-300 hover:text-indigo-200 transition-colors cursor-pointer text-left truncate max-w-[240px]"
                  title={s.url}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Supported Sources Quick Ribbon */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 max-w-2xl mx-auto">
          <div className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
            Supported Sources & Platforms
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Dailymotion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Archive.org
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              YouTube (Permitted)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              TikTok
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Twitter / X
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Reddit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Direct MP4/WebM
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
