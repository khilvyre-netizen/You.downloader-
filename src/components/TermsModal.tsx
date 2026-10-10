import React from 'react';
import { X, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Terms of Service & Fair Use</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-100 mb-1">Permitted Use Notice</p>
              <p>
                This software is intended exclusively for personal archiving of content you own, media for which you have secured explicit permission from copyright holders, or works distributed under open public licenses (e.g. Creative Commons).
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base">1. User Obligations</h3>
            <p className="text-slate-400">
              By using OmniRip, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400 text-xs sm:text-sm">
              <li>You will not use this service to infringe upon the intellectual property rights of any individual, artist, broadcaster, or company.</li>
              <li>You will not attempt to download commercial DRM-encrypted or subscription-gated material.</li>
              <li>You will not overload our servers through automated bot scrapers or abusive request volumes.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base">2. Limitation of Liability</h3>
            <p className="text-slate-400">
              OmniRip is provided on an "as is" and "as available" basis without warranties of any kind. OmniRip does not host video content, maintain permanent media archives, or control third-party video host servers.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base">3. Fair Use & DMCA Compliance</h3>
            <p className="text-slate-400">
              If you believe a link or tool is being used in violation of copyright, please contact the host platform where the video is originally published, as OmniRip does not store or broadcast videos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
          >
            I Accept the Terms
          </button>
        </div>
      </div>
    </div>
  );
};
