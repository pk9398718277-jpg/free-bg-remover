import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const STEPS = [
  {
    number: '01.',
    title: 'Upload Your Photo',
    description:
      'Drag and drop any JPG, JPEG, PNG, or WEBP image into the workspace, paste from your clipboard, or choose one of the built-in sample photos.',
  },
  {
    number: '02.',
    title: 'Local AI Segmentation',
    description:
      'Free BG Remover loads an AI background remover network directly in your browser using WebAssembly, isolating subjects and fine edges without sending files to a server.',
  },
  {
    number: '03.',
    title: 'Customize & Export PNG',
    description:
      'Use our transparent PNG maker to inspect cutouts side by side or with the comparison slider, preview white, black, or custom studio colors, and download your file.',
  },
];

const FAQS: FaqItem[] = [
  {
    question: 'Are my photos uploaded to an external server?',
    answer:
      'No. All image segmentation happens locally inside your browser using WebAssembly and ONNX neural network weights. Your original photos and cutouts never leave your device.',
  },
  {
    question: 'Which image file formats and sizes are supported?',
    answer:
      'Free BG Remover supports JPG, JPEG, PNG, and WEBP files up to 25 MB. Exports are saved as lossless, full-resolution transparent PNG files (or PNGs composited on your chosen background color).',
  },
  {
    question: 'Why does the first image take a few seconds longer?',
    answer:
      'On your first visit, the browser downloads and caches the AI background remover model and WebAssembly runtime (~40 MB for Fast AI). Once cached, every subsequent image processes rapidly without re-downloading.',
  },
  {
    question: 'Can I preview and export with a white, black, or custom background?',
    answer:
      'Yes. After you remove an image background, you can switch between Transparent, White, Black, studio presets, or any custom hex color using the color picker, then download either the transparent PNG or the composited PNG.',
  },
  {
    question: 'Is an account, API key, or subscription required?',
    answer:
      'No account, login, payment card, or external API key is needed. Open Free BG Remover and use our free background remover immediately.',
  },
];

export function LandingSections() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="bg-white">
      
      {/* SEO INTRODUCTION */}
      <section id="about-tool" className="border-t border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-indigo-600">Free AI Background Remover</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Remove Image Backgrounds Online for Free
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Free BG Remover is an online AI background remover that helps you
              remove backgrounds from photos directly in your browser. Upload
              your JPG, JPEG, PNG, or WEBP image, let AI identify the main
              subject, and download your result as a transparent PNG.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Create clean images for product listings, profile pictures,
              presentations, websites, and social media designs. No account or
              external API key is required to use the tool.
            </p>
          </div>
        </div>
      </section>

      {/* IMAGE QUALITY */}
      <section id="image-quality" className="border-t border-slate-200/80 bg-slate-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-indigo-600">Image Quality</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              High-Quality Background Removal for Your Photos
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Create clean cutouts while keeping your original image dimensions.
              Choose the available processing mode and preview the result before
              downloading.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Full-Resolution Export',
                description: 'Download your cutout at the original image dimensions.',
              },
              {
                title: 'Detailed Edges',
                description: 'AI segmentation helps separate subjects from backgrounds, including fine details.',
              },
              {
                title: 'Transparent PNG',
                description: 'Export images with a transparent background for flexible use.',
              },
              {
                title: 'No Watermark',
                description: 'Download clean results without an added watermark.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="font-display text-lg font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-slate-200/80 bg-slate-50/50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-indigo-600">How It Works</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl text-balance">
              Studio-grade cutouts in three straightforward steps.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7"
              >
                <div>
                  <span className="font-mono text-sm font-semibold text-indigo-600 tabular-nums">
                    {step.number}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES (Asymmetric Editorial Bento Grid) */}
      <section id="features" className="border-t border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-indigo-600">Features</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl text-balance">
              Built for speed, edge accuracy, and complete privacy.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Marquee Wide Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 p-8 lg:col-span-2">
              <p className="text-xs font-semibold text-indigo-600">Free Background Remover</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">
                100% In-Browser Processing with Zero Uploads
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Unlike cloud tools that queue your images on remote servers, Free BG Remover runs neural segmentation directly inside your browser tab. Remove image backgrounds from confidential client portraits, product shots, and personal photos without leaving your device.
              </p>
            </div>

            {/* Compact Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <p className="text-xs font-semibold text-indigo-600">Transparent PNG Maker</p>
              <h3 className="mt-2 font-display text-xl font-bold text-slate-950">
                Full-Resolution Alpha PNGs
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Download crisp cutouts at your original dimensions with smooth semi-transparent alpha edges and zero watermarks.
              </p>
            </div>

            {/* Compact Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <p className="text-xs font-semibold text-indigo-600">Custom Backdrops</p>
              <h3 className="mt-2 font-display text-xl font-bold text-slate-950">
                White, Black & Custom Colors
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Test cutouts immediately on pure white for marketplaces, deep black for contrast checks, or any custom brand hex color.
              </p>
            </div>

            {/* Marquee Wide Card 4 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 lg:col-span-2">
              <p className="text-xs font-semibold text-indigo-600">Dual Precision Modes</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">
                Inspect Every Pixel with Split Slider & Studio HD
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Compare your original photo and cutout side by side or drag the interactive before-and-after divider. Switch between Fast AI for instant turnaround and Studio HD for intricate hair, fur, and product edges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="border-t border-slate-200/80 bg-slate-50/50 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-indigo-600">Frequently Asked Questions</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl text-balance">
              Everything you need to know.
            </h2>
          </div>

          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.question} className="px-6 py-5">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md cursor-pointer"
                  >
                    <span className="font-display text-base font-semibold text-slate-950">
                      {faq.question}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 pr-8 text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
            {/* RELATED BACKGROUND REMOVAL GUIDE */}
      <section className="border-t border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-indigo-600">
              Free Image Editing Guide
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Remove Background from Image Online
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Learn how to remove image backgrounds, create transparent PNGs,
              and prepare clean photos for websites, product listings, and
              social media using Free BG Remover.
            </p>
            <a
              href="/remove-background-from-image"
              className="mt-5 inline-flex font-semibold text-indigo-600 underline underline-offset-4 hover:text-indigo-800"
            >
              Read our complete background removal guide →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
