import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export type PageRoute = '/' | '/about' | '/contact' | '/privacy-policy';

interface InfoPagesProps {
  route: Exclude<PageRoute, '/'>;
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export function InfoPages({ route, onNavigateHome, onNavigate }: InfoPagesProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Question');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setFormError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (trimmedMessage.length < 10) {
      setFormError('Please enter a message of at least 10 characters.');
      return;
    }

    setFormError(null);
    setSubmitted(true);
  };

  const resetContactForm = () => {
    setName('');
    setEmail('');
    setSubject('General Question');
    setMessage('');
    setFormError(null);
    setSubmitted(false);
  };

  return (
    <section className="relative bg-white py-10 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_75%_60%_at_50%_0%,rgba(99,102,241,0.10),transparent_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Free Background Remover</span>
        </button>

        {/* ABOUT PAGE */}
        {route === '/about' && (
          <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <p className="text-sm font-semibold text-indigo-600">About</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              About Free BG Remover
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Free BG Remover (planned domain: FreeBGRemover.in) is a browser-native AI background remover and transparent PNG maker built for creators, online sellers, students, and designers.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Real In-Browser AI
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  We use client-side ONNX neural segmentation models compiled for WebAssembly so you can remove image backgrounds accurately without uploading photos to external cloud APIs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center gap-2 text-indigo-600">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Free & Open Access
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  No sign-up wall, credit limits, or watermarks. Upload JPG, JPEG, PNG, or WEBP images, preview white, black, or custom backgrounds, and download full-resolution transparent PNGs.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Ready to cut out an image or want to get in touch?
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Contact Us
                </button>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:brightness-110 cursor-pointer"
                >
                  Open Background Remover
                </button>
              </div>
            </div>
          </article>
        )}

        {/* CONTACT PAGE */}
        {route === '/contact' && (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-indigo-600">Contact</p>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">
                  Get in touch
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Have feedback on Free BG Remover, found a bug with a specific image format, or want to suggest a feature? Send us a message using the form.
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-slate-900">Planned Contact Address</p>
                      <p className="text-xs text-slate-500">support@freebgremover.in</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Note: FreeBGRemover.in is the planned project domain and has not been connected to live mail servers yet.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                {submitted ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" aria-hidden="true" />
                    <h2 className="mt-3 font-display text-lg font-bold text-slate-950">
                      Message ready to send
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Thank you, {name}. Your inquiry regarding <strong className="text-slate-800">{subject}</strong> has been prepared. You can open it directly in your email client:
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={`mailto:support@freebgremover.in?subject=${encodeURIComponent(`[Free BG Remover] ${subject} - ${name}`)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`}
                        className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:brightness-110"
                      >
                        Open Email Draft
                      </a>
                      <button
                        type="button"
                        onClick={resetContactForm}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-slate-950">
                      Send a message
                    </h2>

                    {formError && (
                      <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                        {formError}
                      </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="page-contact-name" className="block text-xs font-semibold text-slate-700">
                          Name
                        </label>
                        <input
                          id="page-contact-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Morgan"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                        />
                      </div>

                      <div>
                        <label htmlFor="page-contact-email" className="block text-xs font-semibold text-slate-700">
                          Email
                        </label>
                        <input
                          id="page-contact-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="page-contact-subject" className="block text-xs font-semibold text-slate-700">
                        Topic
                      </label>
                      <select
                        id="page-contact-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                      >
                        <option value="General Question">General Question</option>
                        <option value="Bug Report">Bug Report</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Privacy Inquiry">Privacy Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="page-contact-message" className="block text-xs font-semibold text-slate-700">
                        Message
                      </label>
                      <textarea
                        id="page-contact-message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your feedback or question..."
                        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                      />
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110 cursor-pointer sm:w-auto"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY PAGE */}
        {route === '/privacy-policy' && (
          <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <p className="text-sm font-semibold text-indigo-600">Legal & Privacy</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Effective date: November 18, 2026 · Free BG Remover (planned domain: FreeBGRemover.in)
            </p>

            <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600">
              <section>
                <h2 className="font-display text-lg font-bold text-slate-950">
                  1. Zero Server Image Uploads
                </h2>
                <p className="mt-2">
                  Free BG Remover operates entirely inside your web browser. When you upload, drag and drop, or paste an image (JPG, JPEG, PNG, or WEBP), the image file stays strictly in local browser memory. Your photos are never transmitted to, stored on, or analyzed by external servers.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-slate-950">
                  2. Local AI Model & WebAssembly Caching
                </h2>
                <p className="mt-2">
                  To perform AI background removal offline-fast inside your browser, Free BG Remover fetches open-source ONNX segmentation model weights and WebAssembly runtime files from public CDN storage on your first run. Your browser caches these model assets locally so subsequent edits run quickly without repeated downloads.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-slate-950">
                  3. No Accounts, Payments, or Personal Databases
                </h2>
                <p className="mt-2">
                  We do not require account creation, login credentials, or payment details, and we do not operate a user database. Exported transparent PNGs and composited background images are generated directly in your browser and saved straight to your device.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-slate-950">
                  4. Contact
                </h2>
                <p className="mt-2">
                  If you have questions about this Privacy Policy, you can reach us via our{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/contact')}
                    className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800 cursor-pointer"
                  >
                    Contact page
                  </button>
                  .
                </p>
              </section>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
