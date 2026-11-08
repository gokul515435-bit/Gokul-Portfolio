import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Single source of truth for which tile is previewing. Only one video may play
 * at a time: starting a preview implicitly stops the previous one.
 * `motionOn` is the header toggle: when off, hovering never auto-plays
 * (the explicit Preview button still works).
 */
type PreviewCtx = {
  activeId: string | null;
  start: (id: string) => void;
  stop: (id?: string) => void;
  motionOn: boolean;
  setMotionOn: (on: boolean) => void;
};

const Ctx = createContext<PreviewCtx | null>(null);
const KEY = 'motion-previews';

function initialMotion() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) return saved === 'on';
  } catch {
    /* storage unavailable */
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [motionOn, setMotionState] = useState(initialMotion);
  const location = useLocation();

  const start = useCallback((id: string) => setActiveId(id), []);
  const stop = useCallback((id?: string) => setActiveId((cur) => (id === undefined || cur === id ? null : cur)), []);
  const setMotionOn = useCallback((on: boolean) => {
    setMotionState(on);
    if (!on) setActiveId(null);
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off');
    } catch {
      /* storage unavailable — choice lasts for this visit only */
    }
  }, []);

  // Pause everything on route / filter change and when the tab is hidden.
  useEffect(() => setActiveId(null), [location.pathname, location.search]);
  useEffect(() => {
    const onVis = () => document.hidden && setActiveId(null);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const value = useMemo(() => ({ activeId, start, stop, motionOn, setMotionOn }), [activeId, start, stop, motionOn, setMotionOn]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreview() {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePreview must be used inside PreviewProvider');
  return c;
}
