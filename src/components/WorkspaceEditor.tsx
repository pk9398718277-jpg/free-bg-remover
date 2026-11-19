import { useCallback, useRef, useState, type DragEvent, type PointerEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  Columns2,
  Download,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Upload,
} from 'lucide-react';
import type {
  BackgroundOption,
  BackgroundPresetId,
  ComparisonMode,
  ModelPrecision,
  ProcessedImageState,
  ProcessingStatus,
  ProgressState,
} from '../types/cutout';
import {
  buildDownloadFilename,
  formatFileSize,
  renderCutoutWithSolidBackground,
  triggerBlobDownload,
} from '../utils/imageProcessing';

const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'transparent', label: 'Transparent', color: null },
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'black', label: 'Black', color: '#09090B' },
  { id: 'slate', label: 'Studio Gray', color: '#F1F5F9' },
  { id: 'sky', label: 'Soft Blue', color: '#DBEAFE' },
  { id: 'lavender', label: 'Soft Violet', color: '#EDE9FE' },
];

interface WorkspaceEditorProps {
  status: ProcessingStatus;
  imageState: ProcessedImageState;
  progress: ProgressState;
  errorMessage: string | null;
  modelPrecision: ModelPrecision;
  onModelPrecisionChange: (model: ModelPrecision) => void;
  onRetry: () => void;
  onReset: () => void;
  onUploadAnother: () => void;
  onDropNewFile: (file: File) => void;
}

export function WorkspaceEditor({
  status,
  imageState,
  progress,
  errorMessage,
  modelPrecision,
  onModelPrecisionChange,
  onRetry,
  onReset,
  onUploadAnother,
  onDropNewFile,
}: WorkspaceEditorProps) {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [selectedBgId, setSelectedBgId] = useState<BackgroundPresetId>('transparent');
  const [customColor, setCustomColor] = useState<string>('#4F46E5');
  const [hexInput, setHexInput] = useState<string>('#4F46E5');
  const [isExportingComposited, setIsExportingComposited] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<'transparent' | 'composited' | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSlider = useRef(false);

  const activeBackgroundColor: string | null =
    selectedBgId === 'custom'
      ? customColor
      : BACKGROUND_OPTIONS.find((opt) => opt.id === selectedBgId)?.color ?? null;

  const updateSliderFromClientX = useCallback((clientX: number) => {
    const el = sliderContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, Math.round(pct * 10) / 10)));
  }, []);

  const handleSliderPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    isDraggingSlider.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handleSliderPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider.current) return;
    updateSliderFromClientX(e.clientX);
  };

  const handleSliderPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (isDraggingSlider.current) {
      isDraggingSlider.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleDownloadTransparent = () => {
    if (!imageState.resultBlob) return;
    setExportError(null);
    const filename = buildDownloadFilename(imageState.fileName, 'transparent');
    triggerBlobDownload(imageState.resultBlob, filename);
    setDownloadSuccess('transparent');
    window.setTimeout(() => setDownloadSuccess(null), 2000);
  };

  const handleDownloadWithBackground = async () => {
    if (!imageState.resultUrl || !activeBackgroundColor) return;
    setExportError(null);
    setIsExportingComposited(true);
    try {
      const blob = await renderCutoutWithSolidBackground(
        imageState.resultUrl,
        activeBackgroundColor
      );
      const suffix = selectedBgId === 'custom' ? 'custom-bg' : `${selectedBgId}-bg`;
      const filename = buildDownloadFilename(imageState.fileName, suffix);
      triggerBlobDownload(blob, filename);
      setDownloadSuccess('composited');
      window.setTimeout(() => setDownloadSuccess(null), 2000);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : 'Unable to export image with background color.'
      );
    } finally {
      setIsExportingComposited(false);
    }
  };

  const handleCustomColorChange = (newColor: string) => {
    setSelectedBgId('custom');
    setCustomColor(newColor);
    setHexInput(newColor.toUpperCase());
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      setSelectedBgId('custom');
      setCustomColor(normalized.toUpperCase());
    }
  };

  const handleResetWorkspace = () => {
    setSelectedBgId('transparent');
    setComparisonMode('side-by-side');
    setSliderPosition(50);
    setExportError(null);
    onReset();
  };

  const previewBackdropStyle =
    activeBackgroundColor !== null
      ? { backgroundColor: activeBackgroundColor }
      : undefined;

  const handleWorkspaceDragOver = (e: DragEvent<HTMLElement>) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      if (!isDraggingFile) setIsDraggingFile(true);
    }
  };

  const handleWorkspaceDragLeave = (e: DragEvent<HTMLElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setIsDraggingFile(false);
  };

  const handleWorkspaceDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onDropNewFile(file);
    }
  };

  return (
    <section
      id="workspace"
      aria-label="Background removal workspace"
      onDragOver={handleWorkspaceDragOver}
      onDragLeave={handleWorkspaceDragLeave}
      onDrop={handleWorkspaceDrop}
      className={`relative bg-white pt-8 pb-16 transition-colors sm:pt-10 sm:pb-20 ${
        isDraggingFile ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/30' : ''
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(99,102,241,0.08),transparent_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Workspace Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-bold text-slate-950 sm:text-lg">
              {imageState.fileName}
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
              <span>{formatFileSize(imageState.fileSizeBytes)}</span>
              {imageState.dimensions && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {imageState.dimensions.width} × {imageState.dimensions.height} px
                  </span>
                </>
              )}
              {status === 'done' && imageState.processingTimeMs !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-600 font-medium">
                    {(imageState.processingTimeMs / 1000).toFixed(1)}s local AI
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Model Quality Selector */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                disabled={status === 'processing'}
                onClick={() => onModelPrecisionChange('isnet_quint8')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                  modelPrecision === 'isnet_quint8'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fast AI
              </button>
              <button
                type="button"
                disabled={status === 'processing'}
                onClick={() => onModelPrecisionChange('isnet_fp16')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                  modelPrecision === 'isnet_fp16'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Studio HD
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetWorkspace}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onUploadAnother}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Upload Another Image</span>
            </button>
          </div>
        </div>

        {/* PROCESSING STATE */}
        {status === 'processing' && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 aspect-[4/3] flex items-center justify-center">
                  <img
                    src={imageState.originalUrl}
                    alt="Original image being processed"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain opacity-80"
                  />
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
                  <h2 className="font-display text-xl font-bold text-slate-950">
                    {progress.stageLabel}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-slate-600">{progress.detailLabel}</p>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>In-browser AI progress</span>
                    <span className="font-mono font-semibold text-indigo-700 tabular-nums">
                      {progress.percent}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={progress.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 transition-all duration-200"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  First run downloads and caches the neural network weights inside your browser. Subsequent images process much faster.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-6 sm:p-10"
          >
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-slate-950">
                Background removal failed
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {errorMessage || 'An unexpected error occurred while processing your image.'}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={onUploadAnother}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>Upload Another Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetWorkspace}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULT STATE */}
        {status === 'done' && imageState.resultUrl && (
          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
            {/* Left / Main Canvas Area */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                {/* Preview Mode Switcher */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setComparisonMode('side-by-side')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        comparisonMode === 'side-by-side'
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Side by Side</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonMode('slider')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        comparisonMode === 'slider'
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Before / After Slider</span>
                    </button>
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    Backdrop: <strong className="text-slate-800">{selectedBgId === 'custom' ? hexInput : BACKGROUND_OPTIONS.find((b) => b.id === selectedBgId)?.label}</strong>
                  </span>
                </div>

                {/* Side by Side View */}
                {comparisonMode === 'side-by-side' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Original Image</span>
                      </div>
                      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                        <img
                          src={imageState.originalUrl}
                          alt="Original uploaded photo"
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full rounded-lg object-contain"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Background Removed</span>
                        <span className="font-mono text-[11px] font-medium text-indigo-600">PNG Alpha</span>
                      </div>
                      <div
                        style={previewBackdropStyle}
                        className={`flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-slate-200 p-2 transition-colors ${
                          activeBackgroundColor === null ? 'checkerboard-bg' : ''
                        }`}
                      >
                        <img
                          src={imageState.resultUrl}
                          alt="Background removed cutout"
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Interactive Before / After Comparison Slider */
                  <div>
                    <div
                      ref={sliderContainerRef}
                      onPointerDown={handleSliderPointerDown}
                      onPointerMove={handleSliderPointerMove}
                      onPointerUp={handleSliderPointerUp}
                      onPointerCancel={handleSliderPointerUp}
                      role="slider"
                      tabIndex={0}
                      aria-label="Before and after background removal comparison slider"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(sliderPosition)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          setSliderPosition((p) => Math.max(0, p - 5));
                        } else if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          setSliderPosition((p) => Math.min(100, p + 5));
                        }
                      }}
                      className={`relative mx-auto flex aspect-[4/3] w-full max-h-[520px] select-none items-center justify-center overflow-hidden rounded-xl border border-slate-200 touch-none cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                        activeBackgroundColor === null ? 'checkerboard-bg' : ''
                      }`}
                      style={previewBackdropStyle}
                    >
                      {/* Cutout Layer (Full Width) */}
                      <img
                        src={imageState.resultUrl}
                        alt="Background removed cutout"
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="pointer-events-none h-full w-full object-contain p-3"
                      />

                      {/* Original Layer (Clipped from left to sliderPosition) */}
                      <div
                        className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-50"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img
                          src={imageState.originalUrl}
                          alt="Original uploaded photo"
                          referrerPolicy="no-referrer"
                          draggable={false}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>

                      {/* Divider Line + Handle */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 w-0.5 bg-indigo-600 shadow-sm"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-md">
                          <ArrowLeftRight className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Corner Labels */}
                      <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-slate-900/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                        Original
                      </span>
                      <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-indigo-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                        Cutout
                      </span>
                    </div>
                    <p className="mt-2.5 text-center text-xs text-slate-500">
                      Drag the divider horizontally to inspect edge accuracy.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls Sidebar: Backgrounds & Export */}
            <aside className="lg:col-span-4 space-y-5">
              {/* Background Options Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                    <h2 className="font-display text-sm font-bold text-slate-950">
                      Background Options
                    </h2>
                  </div>
                  {selectedBgId !== 'transparent' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBgId('transparent')}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Clear to Transparent
                    </button>
                  )}
                </div>

                {/* Preset Swatches */}
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {BACKGROUND_OPTIONS.map((option) => {
                    const isSelected = selectedBgId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedBgId(option.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-7 w-full rounded-lg border border-slate-200 ${
                            option.color === null ? 'checkerboard-bg' : ''
                          }`}
                          style={option.color ? { backgroundColor: option.color } : undefined}
                        />
                        <span className="truncate w-full text-center">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Background Color Picker */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <label
                    htmlFor="custom-bg-color"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Palette className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                    <span>Custom Background Color</span>
                  </label>

                  <div className="mt-2.5 flex items-center gap-2.5">
                    <label
                      className={`relative flex h-10 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border transition-all ${
                        selectedBgId === 'custom'
                          ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                          : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: customColor }}
                      title="Pick custom background color"
                    >
                      <input
                        id="custom-bg-color"
                        type="color"
                        value={customColor}
                        onChange={(e) => handleCustomColorChange(e.target.value.toUpperCase())}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>

                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      onFocus={() => setSelectedBgId('custom')}
                      aria-label="Custom background hex color"
                      maxLength={7}
                      placeholder="#4F46E5"
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-xs font-medium text-slate-900 uppercase focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Download & Action Controls */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-display text-sm font-bold text-slate-950">
                  Export Image
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Full-resolution PNG exported directly from your browser with no watermarks.
                </p>

                {exportError && (
                  <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {exportError}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadTransparent}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {downloadSuccess === 'transparent' ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Transparent PNG Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        <span>Download Transparent PNG</span>
                      </>
                    )}
                  </button>

                  {activeBackgroundColor !== null && (
                    <button
                      type="button"
                      disabled={isExportingComposited}
                      onClick={handleDownloadWithBackground}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
                    >
                      {isExportingComposited ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          <span>Rendering PNG...</span>
                        </>
                      ) : downloadSuccess === 'composited' ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          <span>Downloaded with Background</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" aria-hidden="true" />
                          <span>Download with Background</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={handleResetWorkspace}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={onUploadAnother}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Upload Another</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
