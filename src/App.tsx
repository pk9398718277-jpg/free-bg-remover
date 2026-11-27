import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Navbar } from './components/Navbar';
import { UploadDropzone } from './components/UploadDropzone';
import { LandingSections } from './components/LandingSections';
import { FooterAndModals } from './components/FooterAndModals';
import type { PageRoute } from './components/InfoPages';

const WorkspaceEditor = lazy(() =>
  import('./components/WorkspaceEditor').then((m) => ({ default: m.WorkspaceEditor }))
);
const InfoPages = lazy(() =>
  import('./components/InfoPages').then((m) => ({ default: m.InfoPages }))
);
import type {
  ModelPrecision,
  ProcessedImageState,
  ProcessingStatus,
  ProgressState,
  SampleImageItem,
} from './types/cutout';
import {
  getImageDimensions,
  runInBrowserBackgroundRemoval,
  validateImageFile,
} from './utils/imageProcessing';

const INITIAL_PROGRESS: ProgressState = {
  percent: 0,
  stageLabel: 'Preparing image...',
  detailLabel: 'Initializing in-browser AI workspace...',
};

const INITIAL_IMAGE_STATE: ProcessedImageState = {
  fileName: '',
  fileSizeBytes: 0,
  originalUrl: '',
  resultUrl: null,
  resultBlob: null,
  dimensions: null,
  processingTimeMs: null,
};

function normalizeRoute(pathname: string): PageRoute {
  const cleaned = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (cleaned === '/about') return '/about';
  if (cleaned === '/contact') return '/contact';
  if (cleaned === '/privacy-policy' || cleaned === '/privacy') return '/privacy-policy';
  if (cleaned === '/remove-background-from-image') return '/remove-background-from-image';
  return '/';
}

const ROUTE_METADATA: Record<
  PageRoute,
  { title: string; description: string; canonicalPath: string }
> = {
  '/': {
    title: 'Free Background Remover Online | AI BG Remover',
    description:
      'Remove image backgrounds online for free with our AI background remover. Upload a JPG, PNG or WEBP photo and download a transparent PNG in seconds.',
    canonicalPath: '/',
  },
  '/about': {
    title: 'About Free BG Remover - Free AI Background Remover Online',
    description:
      'Learn how Free BG Remover uses browser-native AI segmentation to remove image backgrounds and create transparent PNGs privately.',
    canonicalPath: '/about',
  },
  '/contact': {
    title: 'Contact Free BG Remover - FreeBGRemover.in',
    description:
      'Contact Free BG Remover with questions, bug reports, or feedback about our free online AI background remover.',
    canonicalPath: '/contact',
  },
  '/privacy-policy': {
    title: 'Privacy Policy - Free BG Remover',
    description:
      'Read how Free BG Remover processes images locally in your browser with zero server uploads and no user tracking.',
    canonicalPath: '/privacy-policy',
  },
  '/remove-background-from-image': {
    title: 'Remove Background from Image Online Free | Free BG Remover',
    description:
      'Remove background from any image online for free with AI. Create clean, transparent PNG images in seconds using Free BG Remover.',
    canonicalPath: '/remove-background-from-image',
  },
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(() =>
    normalizeRoute(window.location.pathname)
  );
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [imageState, setImageState] = useState<ProcessedImageState>(INITIAL_IMAGE_STATE);
  const [progress, setProgress] = useState<ProgressState>(INITIAL_PROGRESS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [modelPrecision, setModelPrecision] = useState<ModelPrecision>('isnet_quint8');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSourceFileRef = useRef<File | null>(null);
  const jobCounterRef = useRef<number>(0);
  const urlsToRevokeRef = useRef<{ original?: string; result?: string }>({});

  const revokeUrls = useCallback((onlyResult = false) => {
    if (!onlyResult && urlsToRevokeRef.current.original) {
      URL.revokeObjectURL(urlsToRevokeRef.current.original);
      urlsToRevokeRef.current.original = undefined;
    }
    if (urlsToRevokeRef.current.result) {
      URL.revokeObjectURL(urlsToRevokeRef.current.result);
      urlsToRevokeRef.current.result = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      revokeUrls(false);
    };
  }, [revokeUrls]);

  // Sync browser back/forward navigation & per-page SEO metadata
  useEffect(() => {
    const meta = ROUTE_METADATA[currentRoute];
    document.title = meta.title;

    const descriptionEl = document.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute('content', meta.description);
    }

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
canonicalEl.setAttribute('href', `https://freebgremover.in${meta.canonicalPath}`);    }
  }, [currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(normalizeRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRoute = useCallback((route: PageRoute, scrollTop = true) => {
    if (window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
    setCurrentRoute(route);
    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const navigateToSection = useCallback(
    (sectionId: string) => {
      if (currentRoute !== '/') {
        if (window.location.pathname !== '/') {
          window.history.pushState(null, '', `/#${sectionId}`);
        }
        setCurrentRoute('/');
        window.setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [currentRoute]
  );

  const executeRemoval = useCallback(
    async (file: File, model: ModelPrecision, existingOriginalUrl?: string) => {
      const jobId = ++jobCounterRef.current;
      const startedAt = performance.now();

      let originalUrl = existingOriginalUrl;
      if (!originalUrl) {
        revokeUrls(false);
        originalUrl = URL.createObjectURL(file);
        urlsToRevokeRef.current.original = originalUrl;
      } else {
        revokeUrls(true);
      }

      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
      setCurrentRoute('/');
      setValidationError(null);
      setErrorMessage(null);
      setStatus('processing');
      setProgress({
        percent: 4,
        stageLabel: 'Initializing AI engine',
        detailLabel: 'Preparing image for in-browser segmentation...',
      });
      setImageState({
        fileName: file.name,
        fileSizeBytes: file.size,
        originalUrl,
        resultUrl: null,
        resultBlob: null,
        dimensions: null,
        processingTimeMs: null,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const dimensions = await getImageDimensions(originalUrl);
        if (jobCounterRef.current !== jobId) return;

        setImageState((prev) => ({ ...prev, dimensions }));

        const resultBlob = await runInBrowserBackgroundRemoval(file, model, (progressUpdate) => {
          if (jobCounterRef.current !== jobId) return;
          setProgress(progressUpdate);
        });

        if (jobCounterRef.current !== jobId) return;

        const resultUrl = URL.createObjectURL(resultBlob);
        urlsToRevokeRef.current.result = resultUrl;
        const processingTimeMs = Math.round(performance.now() - startedAt);

        setImageState((prev) => ({
          ...prev,
          resultUrl,
          resultBlob,
          processingTimeMs,
        }));
        setStatus('done');
      } catch (err) {
        if (jobCounterRef.current !== jobId) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Background removal failed. Please try another image.'
        );
        setStatus('error');
      }
    },
    [revokeUrls]
  );

  const handleFileSelected = useCallback(
    (file: File) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setValidationError(validation.error ?? 'Unsupported image file.');
        if (currentRoute !== '/') {
          navigateToRoute('/');
        }
        if (status !== 'idle') {
          setErrorMessage(validation.error ?? 'Unsupported image file.');
          setStatus('error');
        }
        return;
      }

      activeSourceFileRef.current = file;
      void executeRemoval(file, modelPrecision);
    },
    [currentRoute, executeRemoval, modelPrecision, navigateToRoute, status]
  );

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleTriggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSampleSelected = useCallback(
    async (sample: SampleImageItem) => {
      setValidationError(null);
      try {
        const response = await fetch(sample.src);
        if (!response.ok) {
          throw new Error('Could not load sample image.');
        }
        const blob = await response.blob();
        const file = new File([blob], sample.fileName, {
          type: blob.type || 'image/jpeg',
        });
        activeSourceFileRef.current = file;
        void executeRemoval(file, modelPrecision);
      } catch (err) {
        setValidationError(
          err instanceof Error
            ? err.message
            : 'Unable to load sample image. Please upload an image from your device.'
        );
      }
    },
    [executeRemoval, modelPrecision]
  );

  const handleReset = useCallback(() => {
    jobCounterRef.current += 1;
    activeSourceFileRef.current = null;
    revokeUrls(false);
    setStatus('idle');
    setImageState(INITIAL_IMAGE_STATE);
    setProgress(INITIAL_PROGRESS);
    setErrorMessage(null);
    setValidationError(null);
    navigateToRoute('/');
  }, [navigateToRoute, revokeUrls]);

  const handleRetry = useCallback(() => {
    if (activeSourceFileRef.current) {
      void executeRemoval(
        activeSourceFileRef.current,
        modelPrecision,
        urlsToRevokeRef.current.original
      );
    } else {
      handleReset();
    }
  }, [executeRemoval, handleReset, modelPrecision]);

  const handleModelPrecisionChange = useCallback(
    (nextModel: ModelPrecision) => {
      setModelPrecision(nextModel);
      if (activeSourceFileRef.current && (status === 'done' || status === 'error')) {
        void executeRemoval(
          activeSourceFileRef.current,
          nextModel,
          urlsToRevokeRef.current.original
        );
      }
    },
    [executeRemoval, status]
  );

  // Global clipboard image paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            e.preventDefault();
            handleFileSelected(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFileSelected]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden="true"
      />

      <Navbar
        currentRoute={currentRoute}
        onUploadClick={handleTriggerFilePicker}
        onLogoClick={handleReset}
        onSectionNavigate={navigateToSection}
        onRouteNavigate={(route) => navigateToRoute(route)}
      />

      <main className="flex-1">
        {currentRoute !== '/' ? (
          <Suspense
            fallback={
              <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">
                Loading page...
              </div>
            }
          >
            <InfoPages
              route={currentRoute}
              onNavigateHome={() => navigateToRoute('/')}
              onNavigate={(route) => navigateToRoute(route)}
            />
          </Suspense>
        ) : (
          <>
            {status === 'idle' ? (
              <UploadDropzone
                onFileSelected={handleFileSelected}
                onSampleSelected={handleSampleSelected}
                onTriggerFilePicker={handleTriggerFilePicker}
                validationError={validationError}
                onDismissError={() => setValidationError(null)}
              />
            ) : (
              <Suspense
                fallback={
                  <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
                    Loading background remover workspace...
                  </div>
                }
              >
                <WorkspaceEditor
                  status={status}
                  imageState={imageState}
                  progress={progress}
                  errorMessage={errorMessage}
                  modelPrecision={modelPrecision}
                  onModelPrecisionChange={handleModelPrecisionChange}
                  onRetry={handleRetry}
                  onReset={handleReset}
                  onUploadAnother={handleTriggerFilePicker}
                  onDropNewFile={handleFileSelected}
                />
              </Suspense>
            )}

            <LandingSections />
          </>
        )}
      </main>

      <FooterAndModals
        currentRoute={currentRoute}
        onNavigate={(route) => navigateToRoute(route)}
      />
    </div>
  );
}
