import React from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  getScrollTarget?: () => HTMLElement | null;
  threshold?: number;
  className?: string;
}

export function ScrollToTopButton({
  getScrollTarget,
  threshold = 280,
  className = '',
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const resolveTarget = () => getScrollTarget?.() ?? null;

    const updateVisibility = () => {
      const target = resolveTarget();
      const scrollTop = target ? target.scrollTop : window.scrollY;
      setVisible(scrollTop > threshold);
    };

    const target = resolveTarget();
    const scrollSource: HTMLElement | Window = target ?? window;

    updateVisibility();
    scrollSource.addEventListener('scroll', updateVisibility, { passive: true } as AddEventListenerOptions);
    if (scrollSource !== window) {
      window.addEventListener('scroll', updateVisibility, { passive: true });
    }

    return () => {
      scrollSource.removeEventListener('scroll', updateVisibility as EventListener);
      if (scrollSource !== window) {
        window.removeEventListener('scroll', updateVisibility);
      }
    };
  }, [getScrollTarget, threshold]);

  const handleClick = () => {
    const target = getScrollTarget?.() ?? null;
    if (target) {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Remonter en haut"
      title="Remonter en haut"
      className={`app-floating-scroll-top fixed right-4 sm:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ${visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a4d7a 0%, #153d61 100%)',
      }}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}