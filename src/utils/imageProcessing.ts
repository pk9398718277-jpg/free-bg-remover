import type { Config } from '@imgly/background-removal';
import type { ImageDimensions, ModelPrecision, ProgressState } from '../types/cutout';

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ACCEPTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB safety limit for in-browser inference

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No image file was provided.' };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const hasValidMime = file.type ? ACCEPTED_MIME_TYPES.has(file.type.toLowerCase()) : false;
  const hasValidExt = ACCEPTED_EXTENSIONS.has(extension);

  if (!hasValidMime && !hasValidExt) {
    return {
      valid: false,
      error: `Unsupported file format "${file.name}". Please upload a JPG, JPEG, PNG, or WEBP image.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty. Please choose a valid image.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image exceeds the 25 MB browser processing limit. Please upload a smaller file.',
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Could not decode image dimensions. The file may be corrupted.'));
    };
    img.src = url;
  });
}

export function mapImglyProgress(key: string, current: number, total: number): ProgressState {
  const ratio = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;

  if (key.startsWith('fetch:')) {
    const assetName = key.replace('fetch:', '');
    if (assetName.includes('onnx') || assetName.includes('model')) {
      return {
        percent: Math.max(8, Math.round(ratio * 55)),
        stageLabel: 'Downloading AI segmentation model',
        detailLabel: total > 0 ? `${formatFileSize(current)} of ${formatFileSize(total)}` : 'Fetching neural network weights...',
      };
    }
    if (assetName.includes('wasm')) {
      return {
        percent: Math.max(5, Math.round(ratio * 25)),
        stageLabel: 'Preparing WebAssembly engine',
        detailLabel: total > 0 ? `${formatFileSize(current)} of ${formatFileSize(total)}` : 'Initializing local runtime...',
      };
    }
    return {
      percent: Math.max(5, Math.round(ratio * 45)),
      stageLabel: 'Loading browser AI assets',
      detailLabel: 'Caching model files locally for instant reuse...',
    };
  }

  if (key.startsWith('compute:')) {
    return {
      percent: Math.min(97, 60 + Math.round(ratio * 37)),
      stageLabel: 'Removing background with AI',
      detailLabel: 'Detecting foreground edges and alpha matte...',
    };
  }

  return {
    percent: Math.min(95, Math.max(10, Math.round(ratio * 95))),
    stageLabel: 'Processing image',
    detailLabel: 'Running in-browser segmentation...',
  };
}

export async function runInBrowserBackgroundRemoval(
  source: Blob | File | string,
  model: ModelPrecision,
  onProgress: (state: ProgressState) => void
): Promise<Blob> {
  let highestPercent = 4;

  const config: Config = {
    model,
    device: 'cpu',
    output: {
      format: 'image/png',
      quality: 1,
    },
    progress: (key: string, current: number, total: number) => {
      const mapped = mapImglyProgress(key, current, total);
      highestPercent = Math.max(highestPercent, mapped.percent);
      onProgress({
        percent: highestPercent,
        stageLabel: mapped.stageLabel,
        detailLabel: mapped.detailLabel,
      });
    },
  };

  try {
    const { removeBackground } = await import('@imgly/background-removal');
    const resultBlob = await removeBackground(source, config);
    onProgress({
      percent: 100,
      stageLabel: 'Background removed',
      detailLabel: 'Transparent PNG ready to export',
    });
    return resultBlob;
  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : String(err);
    if (rawMessage.toLowerCase().includes('fetch') || rawMessage.toLowerCase().includes('network')) {
      throw new Error(
        'Failed to download AI model assets. Please check your internet connection and retry.'
      );
    }
    throw new Error(
      rawMessage || 'Background removal failed while processing this image. Please try another photo.'
    );
  }
}

export function buildDownloadFilename(originalName: string, suffix: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '').trim() || 'free-bg-remover-image';
  const sanitized = baseName.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${sanitized || 'free-bg-remover-image'}-${suffix}.png`;
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function renderCutoutWithSolidBackground(
  resultUrl: string,
  backgroundColor: string
): Promise<Blob> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Unable to render cutout image onto canvas.'));
    img.src = resultUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable in this browser.');
  }

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to encode composited PNG image.'));
        }
      },
      'image/png',
      1
    );
  });
}
