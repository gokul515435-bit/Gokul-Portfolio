import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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
  return (
    <header className="header">
      <div className="header__side">
        <MotionToggle />
      </div>
      <nav className="header__nav" aria-label="Primary">
        {NAV.map((n, i) => (
          <NavLink
            key={n.to}
            to={n.to}
            end
            style={{ '--i': i } as React.CSSProperties}
            className={({ isActive }) => `pill${isActive ? ' is-active' : ''}`}
          >
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
