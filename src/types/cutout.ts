export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

export type ComparisonMode = 'slider' | 'side-by-side';

export type ModelPrecision = 'isnet_quint8' | 'isnet_fp16';

export type BackgroundPresetId =
  | 'transparent'
  | 'white'
  | 'black'
  | 'slate'
  | 'sky'
  | 'lavender'
  | 'custom';

export interface BackgroundOption {
  id: BackgroundPresetId;
  label: string;
  color: string | null; // null represents transparent checkerboard
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessedImageState {
  fileName: string;
  fileSizeBytes: number;
  originalUrl: string;
  resultUrl: string | null;
  resultBlob: Blob | null;
  dimensions: ImageDimensions | null;
  processingTimeMs: number | null;
}

export interface ProgressState {
  percent: number;
  stageLabel: string;
  detailLabel: string;
}

export interface SampleImageItem {
  id: string;
  title: string;
  category: string;
  src: string;
  fileName: string;
}
