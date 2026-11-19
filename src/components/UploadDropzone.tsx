import { useState, type DragEvent } from 'react';
import { AlertCircle, ImagePlus, Upload } from 'lucide-react';
import type { SampleImageItem } from '../types/cutout';

export const SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sneaker',
    title: 'Product Shot',
    category: 'E-Commerce',
    src: '/src/assets/images/sample_sneaker_1795004508330.jpg',
    fileName: 'athletic-sneaker.jpg',
  },
  {
    id: 'portrait',
    title: 'Studio Portrait',
    category: 'People & Hair',
    src: '/src/assets/images/sample_portrait_1795004508990.jpg',
    fileName: 'studio-portrait.jpg',
  },
  {
    id: 'headphones',
    title: 'Hardware',
    category: 'Commercial',
    src: '/src/assets/images/sample_headphones_1795004509622.jpg',
    fileName: 'wireless-headphones.jpg',
  },
];

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  onSampleSelected: (sample: SampleImageItem) => void;
  onTriggerFilePicker: () => void;
  validationError: string | null;
  onDismissError: () => void;
}

export function UploadDropzone({
  onFileSelected,
  onSampleSelected,
  onTriggerFilePicker,
  validationError,
  onDismissError,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <section id="top" className="relative overflow-hidden bg-white pt-10 pb-16 sm:pt-14 sm:pb-20">
      {/* Subtle white + purple/blue gradient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[440px] bg-[radial-gradient(ellipse_75%_60%_at_50%_0%,rgba(99,102,241,0.12),rgba(124,58,237,0.06)_50%,transparent_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Hero Copy */}
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="font-display font-extrabold tracking-tight text-slate-950 text-balance"
            style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.75rem)', lineHeight: 1.08 }}
          >
            Remove Image Background{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              in Seconds.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Remove backgrounds from your images instantly with our free AI background remover and transparent PNG maker.
          </p>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div
            role="alert"
            className="mx-auto mt-6 flex max-w-3xl items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={onDismissError}
              className="shrink-0 font-medium text-red-700 underline underline-offset-2 hover:text-red-900 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Large Drag & Drop Image Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={onTriggerFilePicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTriggerFilePicker();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload or drag and drop an image file (JPG, JPEG, PNG, or WEBP)"
          className={`group relative mx-auto mt-8 max-w-3xl cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-4 sm:p-14 ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/70 shadow-lg shadow-indigo-500/10 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/60 shadow-sm'
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50 border border-indigo-100 text-indigo-600 transition-transform duration-150 group-hover:scale-105">
            <ImagePlus className="h-8 w-8" aria-hidden="true" />
          </div>

          <h2 className="mt-5 font-display text-xl font-bold text-slate-900 sm:text-2xl">
            {isDragging ? 'Drop your image to remove background' : 'Drag & drop an image here'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            or paste from clipboard (<span className="font-mono text-xs text-slate-500">Ctrl+V</span>)
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTriggerFilePicker();
              }}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-150 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="h-5 w-5" aria-hidden="true" />
              <span>Upload Image</span>
            </button>
          </div>

          <p className="mt-5 text-xs text-slate-500 sm:text-sm">
            Free Background Remover <span aria-hidden="true">·</span> Supports JPG, JPEG, PNG and WEBP <span aria-hidden="true">·</span> 100% browser-based AI
          </p>
        </div>

        {/* One-Click Sample Gallery */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm font-medium text-slate-600">
              No image on hand? Try a sample photo:
            </p>
            <div className="grid w-full grid-cols-1 gap-2.5 min-[480px]:grid-cols-3 sm:w-auto sm:flex sm:items-center sm:gap-3">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSampleSelected(sample)}
                  className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 cursor-pointer"
                >
                  {failedImages[sample.id] ? (
                    <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700">
                      <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    </div>
                  ) : (
                    <img
                      src={sample.src}
                      alt={sample.title}
                      width={48}
                      height={40}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => setFailedImages((prev) => ({ ...prev, [sample.id]: true }))}
                      className="h-10 w-12 shrink-0 rounded-lg object-cover transition-transform duration-150 group-hover:scale-105"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900">
                      {sample.title}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">
                      {sample.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
