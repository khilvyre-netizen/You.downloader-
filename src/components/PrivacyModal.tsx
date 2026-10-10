import React from 'react';
import { X, ShieldCheck, HardDrive, EyeOff, Clock } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Privacy Policy</h2>
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
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">Our Core Commitment: Zero Permanent Logs</p>
              <p className="text-slate-400 text-xs">
                OmniRip operates as an ephemeral proxy converter. We do not store your download history, track personal identity, or require accounts.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base">1. Information We Collect</h3>
            <p className="text-slate-400">
              We collect the minimum information technically necessary to execute video extraction:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400 text-xs sm:text-sm">
              <li>The URL submitted for format analysis and media downloading.</li>
              <li>Transient IP addresses temporarily evaluated solely for rate-limiting and DDoS mitigation (reset every 60 seconds).</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base">2. Storage & Automatic File Deletion</h3>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Post-Download Purge:</strong> When you download your generated file, our server unlinks and deletes the file from local storage within 60 seconds.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <HardDrive className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>15-Minute Garbage Collection:</strong> Inactive or abandoned download tasks are automatically deleted by our scheduled background cleaner within 15 minutes.
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base">3. No Third-Party Trackers</h3>
            <p className="text-slate-400">
              We do not sell, rent, or trade user data. We do not embed surveillance analytics trackers or cross-site advertising pixels.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base">4. Contact</h3>
            <p className="text-slate-400">
              For security or privacy concerns, please open an inquiry or contact the site administrator.
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
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
