import React, { useState } from 'react';
import { Download, Film, Music, Clock, User, ExternalLink, Check, Sparkles, X } from 'lucide-react';
import { VideoMetadata, VideoFormatOption, AudioFormatOption } from '../types';
import { formatDuration, formatBytes } from '../utils';

interface VideoPreviewCardProps {
  metadata: VideoMetadata;
  onStartDownload: (params: {
    formatId: string;
    formatType: 'video' | 'audio';
    quality: string;
    outputFormat: 'mp4' | 'webm' | 'mp3' | 'm4a';
  }) => void;
  onClear: () => void;
}

export const VideoPreviewCard: React.FC<VideoPreviewCardProps> = ({
  metadata,
  onStartDownload,
  onClear,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedVideoFormatId, setSelectedVideoFormatId] = useState<string>(
    metadata.videoOptions[0]?.formatId || 'best'
  );
  const [selectedAudioFormatId, setSelectedAudioFormatId] = useState<string>(
    metadata.audioOptions[0]?.formatId || 'bestaudio-mp3'
  );
  const [videoContainerExt, setVideoContainerExt] = useState<'mp4' | 'webm'>('mp4');
  const [audioContainerExt, setAudioContainerExt] = useState<'mp3' | 'm4a'>('mp3');

  const selectedVideoOption = metadata.videoOptions.find(
    (o) => o.formatId === selectedVideoFormatId
  ) || metadata.videoOptions[0];

  const selectedAudioOption = metadata.audioOptions.find(
    (o) => o.formatId === selectedAudioFormatId
  ) || metadata.audioOptions[0];

  const handleDownloadClick = () => {
    if (activeTab === 'video') {
      onStartDownload({
        formatId: selectedVideoFormatId,
        formatType: 'video',
        quality: selectedVideoOption?.resolution || 'Original',
        outputFormat: videoContainerExt,
      });
    } else {
      onStartDownload({
        formatId: selectedAudioFormatId,
        formatType: 'audio',
        quality: selectedAudioOption?.label || '320kbps',
        outputFormat: audioContainerExt,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Close / Dismiss button */}
        <button
          onClick={onClear}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss preview"
          aria-label="Dismiss preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Thumbnail and Core Metadata */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 group shadow-lg">
              {metadata.thumbnail ? (
                <img
                  src={metadata.thumbnail}
                  alt={metadata.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Film className="w-12 h-12 stroke-1" />
                  <span className="text-xs">No thumbnail available</span>
                </div>
              )}

              {/* High-contrast duration badge */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-white font-mono text-xs font-semibold tabular-nums shadow-sm">
                {formatDuration(metadata.duration)}
              </div>

              {/* Source Extractor tag */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-indigo-950/90 border border-indigo-700/60 text-indigo-200 text-[11px] font-semibold">
                {metadata.extractor}
              </div>
            </div>

            {/* Video Details */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">
                {metadata.title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-300 truncate">{metadata.uploader}</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatDuration(metadata.duration)}</span>
                </span>
                {metadata.webpageUrl && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <a
                      href={metadata.webpageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>

              {metadata.description && (
                <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Format & Quality Selectors */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
            <div>
              {/* Media Type Tabs (Video vs Audio) */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'video'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  Video (MP4 / WEBM)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('audio')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'audio'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Audio Only (MP3 / M4A)
                </button>
              </div>

              {/* Quality & Format Options */}
              {activeTab === 'video' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Select Video Quality
                      </label>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400">Container:</span>
                        <button
                          type="button"
                          onClick={() => setVideoContainerExt('mp4')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            videoContainerExt === 'mp4'
                              ? 'bg-indigo-600/80 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          MP4
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoContainerExt('webm')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            videoContainerExt === 'webm'
                              ? 'bg-indigo-600/80 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          WEBM
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {metadata.videoOptions.map((opt) => {
                        const isSelected = selectedVideoFormatId === opt.formatId;
                        return (
                          <button
                            key={opt.formatId}
                            type="button"
                            onClick={() => setSelectedVideoFormatId(opt.formatId)}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                                : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
                                <span>{opt.label}</span>
                                {opt.height >= 1080 && (
                                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">
                                    FHD
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {opt.filesize ? formatBytes(opt.filesize) : 'Dynamic stream'}
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-700" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Audio Only Mode */
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Select Audio Quality
                      </label>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400">Format:</span>
                        <button
                          type="button"
                          onClick={() => setAudioContainerExt('mp3')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            audioContainerExt === 'mp3'
                              ? 'bg-indigo-600/80 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          MP3
                        </button>
                        <button
                          type="button"
                          onClick={() => setAudioContainerExt('m4a')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            audioContainerExt === 'm4a'
                              ? 'bg-indigo-600/80 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          M4A
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {metadata.audioOptions.map((opt) => {
                        const isSelected = selectedAudioFormatId === opt.formatId;
                        return (
                          <button
                            key={opt.formatId}
                            type="button"
                            onClick={() => setSelectedAudioFormatId(opt.formatId)}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                                : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
                                <span>{opt.label}</span>
                                {opt.abr && opt.abr >= 256 && (
                                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30">
                                    HQ
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {opt.filesize ? formatBytes(opt.filesize) : 'Direct audio stream'}
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-700" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Strip */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Selected: </span>
                <span className="font-semibold text-slate-200">
                  {activeTab === 'video'
                    ? `${selectedVideoOption?.label} · ${videoContainerExt.toUpperCase()}`
                    : `${selectedAudioOption?.label} · ${audioContainerExt.toUpperCase()}`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDownloadClick}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download {activeTab === 'video' ? videoContainerExt.toUpperCase() : audioContainerExt.toUpperCase()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
