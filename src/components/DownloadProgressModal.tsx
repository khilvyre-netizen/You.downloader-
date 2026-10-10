import React from 'react';
import { DownloadCloud, CheckCircle2, AlertCircle, Loader2, ArrowDownToLine, Trash2, X } from 'lucide-react';
import { DownloadJobStatus } from '../types';
import { formatBytes } from '../utils';

interface DownloadProgressModalProps {
  job: DownloadJobStatus | null;
  onClose: () => void;
  onCancelJob: (jobId: string) => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  job,
  onClose,
  onCancelJob,
}) => {
  if (!job) return null;

  const isComplete = job.status === 'ready';
  const isFailed = job.status === 'error';
  const isProcessing = job.status === 'downloading' || job.status === 'converting' || job.status === 'queued';

  const handleDownloadFile = () => {
    if (job.readyUrl) {
      // Trigger download
      const link = document.createElement('a');
      link.href = job.readyUrl;
      link.setAttribute('download', job.fileName || `OmniRip_${job.id.slice(0, 8)}.${job.targetExt}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isComplete
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                : isFailed
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isFailed ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isComplete ? 'Download Ready!' : isFailed ? 'Processing Error' : 'Processing Media'}
            </h3>
            <p className="text-xs text-slate-400">
              {isComplete
                ? 'Your file has been converted and is ready to save.'
                : isFailed
                ? 'Could not complete the media extraction.'
                : job.status === 'converting'
                ? 'Merging audio/video tracks with FFmpeg...'
                : 'Downloading media stream from source...'}
            </p>
          </div>
        </div>

        {/* Progress Bar (when downloading/converting) */}
        {isProcessing && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">
                {job.status === 'converting' ? 'Encoding & Finalizing' : 'Downloading'}
              </span>
              <span className="font-mono text-indigo-300 font-bold tabular-nums">
                {job.progress}%
              </span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${job.progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{job.speed ? `Speed: ${job.speed}` : 'Optimizing connection'}</span>
              <span>{job.eta ? `ETA: ${job.eta}` : 'A few moments...'}</span>
            </div>
          </div>
        )}

        {/* Complete State Card */}
        {isComplete && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">File Name:</span>
              <span className="font-mono text-slate-200 font-medium truncate max-w-[200px]">
                {job.fileName || `video.${job.targetExt}`}
              </span>
            </div>
            {job.fileSize && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">File Size:</span>
                <span className="text-slate-200 font-semibold">{formatBytes(job.fileSize)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Format:</span>
              <span className="text-indigo-400 font-bold uppercase">{job.targetExt}</span>
            </div>
            <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
              Auto-deletion: Temporary copy automatically deleted from server after download.
            </div>
          </div>
        )}

        {/* Failed State Card */}
        {isFailed && (
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 mb-6 text-xs text-rose-200 space-y-1">
            <p className="font-semibold text-rose-100">Unable to finish download</p>
            <p className="text-rose-300/80">{job.error || 'Server error occurred during processing.'}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isComplete ? (
            <>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Save to Device</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </>
          ) : isFailed ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onCancelJob(job.id)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700/60 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel & Purge Task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
