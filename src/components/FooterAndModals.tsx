import type { MouseEvent } from 'react';
import type { PageRoute } from './InfoPages';

interface FooterProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
}

export function FooterAndModals({ currentRoute, onNavigate }: FooterProps) {
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, route: PageRoute) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="font-display text-base font-extrabold tracking-tight text-slate-950"
            >
              Free{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                BG Remover
              </span>
            </a>
            <p className="mt-1.5 text-xs text-slate-500">
              Free AI background remover and transparent PNG maker. Zero uploads, zero watermarks.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="/about"
              onClick={(e) => handleLinkClick(e, '/about')}
              aria-current={currentRoute === '/about' ? 'page' : undefined}
              className={`transition-colors hover:text-slate-950 hover:underline hover:underline-offset-4 ${
                currentRoute === '/about' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              About
            </a>
            <a
              href="/contact"
              onClick={(e) => handleLinkClick(e, '/contact')}
              aria-current={currentRoute === '/contact' ? 'page' : undefined}
              className={`transition-colors hover:text-slate-950 hover:underline hover:underline-offset-4 ${
                currentRoute === '/contact' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Contact
            </a>
            <a
              href="/privacy-policy"
              onClick={(e) => handleLinkClick(e, '/privacy-policy')}
              aria-current={currentRoute === '/privacy-policy' ? 'page' : undefined}
              className={`transition-colors hover:text-slate-950 hover:underline hover:underline-offset-4 ${
                currentRoute === '/privacy-policy' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Privacy Policy
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Free BG Remover · Planned domain: FreeBGRemover.in</p>
          <p>Free Background Remover · Supports JPG, JPEG, PNG and WEBP</p>
        </div>
      </div>
    </footer>
  );
}
