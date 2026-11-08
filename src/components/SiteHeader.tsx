import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MotionToggle } from './MotionToggle';

const NAV = [
  { to: '/', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

/** Adds `is-scrolled` to <html> once the page leaves the top, so CSS can collapse the header. */
function useScrolledClass(threshold = 40) {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const update = () => root.classList.toggle('is-scrolled', window.scrollY > threshold);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      root.classList.remove('is-scrolled');
    };
  }, [threshold]);
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
