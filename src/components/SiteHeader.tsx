import { useEffect, useState, type CSSProperties } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MotionToggle } from './MotionToggle';

const NAV = [
  { to: '/', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

/**
 * Header state classes on <html>, driven by scroll direction:
 *  - `is-scrolled`: menu collapsed (scrolling down, away from the top) — the pills slide up
 *    and the switch shrinks. Scrolling up — anywhere on the page — brings the menu back.
 *  - `over-reel`: the header is still sitting over the dark showreel (white treatment).
 */
function useScrolledClass(threshold = 40, jitter = 6) {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let lastY = window.scrollY;
    let collapsed = false;
    const update = () => {
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      if (y <= threshold) collapsed = false;
      else if (dy > jitter) collapsed = true;
      else if (dy < -jitter) collapsed = false;
      if (Math.abs(dy) > jitter || y <= threshold) lastY = y;
      root.classList.toggle('is-scrolled', collapsed);
      const reel = document.querySelector<HTMLElement>('.reel');
      const header = document.querySelector<HTMLElement>('.header');
      // "Over the reel" only while the reel actually sits behind the header
      // (on phones the reel starts below the header, so this stays false there).
      const r = reel?.getBoundingClientRect();
      root.classList.toggle('over-reel', !!r && r.top <= 1 && r.bottom > (header?.offsetHeight ?? 0));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.classList.remove('is-scrolled', 'over-reel');
    };
  }, [threshold, jitter]);
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  if (compact) return null;
  return <FullHeader />;
}

function FullHeader() {
  useScrolledClass();
  // Phones only: the three links collapse into one hamburger menu (hidden by CSS on larger screens).
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onScroll = () => Math.abs(window.scrollY - startY) > 24 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open]);

  return (
    <>
    {/* Invisible layer: a tap outside the open menu only closes it, and never opens what is underneath. */}
    {open && <div className="menu-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />}
    <header className={`header${open ? ' is-menu-open' : ''}`}>
      <div className="header__side">
        <MotionToggle />
      </div>
      <button
        type="button"
        className="burger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <nav id="site-nav" className="header__nav" aria-label="Primary">
        {NAV.map((n, i) => (
          <NavLink
            key={n.to}
            to={n.to}
            end
            style={{ '--i': i } as CSSProperties}
            className={({ isActive }) => `pill${isActive ? ' is-active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
    </>
  );
}
