export interface VideoFormatOption {
  formatId: string;
  label: string;
  resolution: string;
  height: number;
  ext: string;
  filesize?: number;
  hasAudio: boolean;
}

export interface AudioFormatOption {
  formatId: string;
  label: string;
  ext: string;
  abr?: number;
  filesize?: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  duration: number;
  uploader: string;
  uploaderUrl: string | null;
  extractor: string;
  webpageUrl: string;
  videoOptions: VideoFormatOption[];
  audioOptions: AudioFormatOption[];
}

export interface DownloadJobStatus {
  id: string;
  status: 'queued' | 'downloading' | 'converting' | 'ready' | 'error';
  progress: number;
  speed?: string;
  eta?: string;
  fileName?: string;
  fileSize?: number;
  targetExt: string;
  error?: string;
  readyUrl?: string | null;
}

export interface PlatformInfo {
  name: string;
  note: string;
  iconName?: string;
}

export interface SampleItem {
  title: string;
  url: string;
  type: string;
}
