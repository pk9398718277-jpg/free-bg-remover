import { useState, type MouseEvent } from 'react';
import { Menu, Upload, X } from 'lucide-react';
import type { PageRoute } from './InfoPages';

interface NavbarProps {
  currentRoute: PageRoute;
  onUploadClick: () => void;
  onLogoClick: () => void;
  onSectionNavigate: (sectionId: string) => void;
  onRouteNavigate: (route: PageRoute) => void;
}

export function Navbar({
  currentRoute,
  onUploadClick,
  onLogoClick,
  onSectionNavigate,
  onRouteNavigate,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavSection = (e: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onSectionNavigate(sectionId);
  };

  const handleContactLink = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    setMobileMenuOpen(false);
    onRouteNavigate('/contact');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
              return;
            }
            e.preventDefault();
            setMobileMenuOpen(false);
            onLogoClick();
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 text-white shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="2.2">
              <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
              <path d="M8.5 15.5L11.5 12l2.2 2.4 2.8-3.6 3 4.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
            Free <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">BG Remover</span>
          </span>
        </a>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="/#how-it-works"
            onClick={(e) => handleNavSection(e, 'how-it-works')}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950 hover:underline hover:underline-offset-4"
          >
            How It Works
          </a>
          <a
            href="/#features"
            onClick={(e) => handleNavSection(e, 'features')}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950 hover:underline hover:underline-offset-4"
          >
            Features
          </a>
          <a
            href="/#faq"
            onClick={(e) => handleNavSection(e, 'faq')}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950 hover:underline hover:underline-offset-4"
          >
            FAQ
          </a>
          <a
            href="/contact"
            onClick={handleContactLink}
            aria-current={currentRoute === '/contact' ? 'page' : undefined}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-950 hover:underline hover:underline-offset-4 ${
              currentRoute === '/contact' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onUploadClick();
            }}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            <a
              href="/#how-it-works"
              onClick={(e) => handleNavSection(e, 'how-it-works')}
              className="rounded-md px-2 py-2 hover:bg-slate-50"
            >
              How It Works
            </a>
            <a
              href="/#features"
              onClick={(e) => handleNavSection(e, 'features')}
              className="rounded-md px-2 py-2 hover:bg-slate-50"
            >
              Features
            </a>
            <a
              href="/#faq"
              onClick={(e) => handleNavSection(e, 'faq')}
              className="rounded-md px-2 py-2 hover:bg-slate-50"
            >
              FAQ
            </a>
            <a
              href="/contact"
              onClick={handleContactLink}
              className="rounded-md px-2 py-2 text-left hover:bg-slate-50"
            >
              Contact
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onUploadClick();
              }}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Upload Image</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
