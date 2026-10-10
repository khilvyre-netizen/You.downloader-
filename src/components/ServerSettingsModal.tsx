import React, { useState } from 'react';
import { X, Server, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl, isStaticHost } from '../api';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const currentUrl = getApiBaseUrl();
  const [apiUrl, setApiUrl] = useState(currentUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    const targetUrl = apiUrl.trim().replace(/\/$/, '');

    try {
      const endpoint = `${targetUrl}/api/info`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (res.ok && data?.service) {
        setTestStatus('success');
        setTestMessage(`Connected successfully to ${data.service}!`);
      } else {
        setTestStatus('error');
        setTestMessage(`Received invalid response from ${endpoint}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${err.message || 'Server unreachable or CORS blocked'}`);
    }
  };

  const handleSave = () => {
    setCustomApiUrl(apiUrl.trim() || null);
    onSaved();
    onClose();
  };

  const handleReset = () => {
    setApiUrl('');
    setCustomApiUrl(null);
    setTestStatus('idle');
    setTestMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Backend Server Settings</h3>
            <p className="text-xs text-slate-400">Configure remote API endpoint for static hosting</p>
          </div>
        </div>

        {isStaticHost() && (
          <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 leading-relaxed">
            <strong>GitHub Pages Notice:</strong> GitHub Pages only serves static files (HTML, JS, CSS) and cannot execute Python, yt-dlp, or Node.js. To process video downloads, connect this frontend to your deployed backend (e.g. Render, Railway, fly.io, or VPS).
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              API Base URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => {
                setApiUrl(e.target.value);
                setTestStatus('idle');
              }}
              placeholder="e.g. https://my-downloader-api.onrender.com (or leave empty for local)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Leave empty if the backend is running on the same domain or port.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !apiUrl.trim()}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-300 text-xs transition-colors cursor-pointer"
            >
              Reset to Default
            </button>
          </div>

          {testStatus === 'success' && (
            <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
