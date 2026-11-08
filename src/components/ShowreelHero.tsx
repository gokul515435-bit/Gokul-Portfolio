import { useEffect, useRef, useState } from 'react';
import { showreel } from '../data/projects';
import { usePreview } from '../lib/preview';
import { usePrefersReducedMotion } from '../lib/hooks';

/**
 * Full-screen showreel at the top of the Work page.
 * Autoplays muted and looping (unless reduced motion is on or the motion switch is off);
 * the buttons unmute it or pause it. Pauses itself when scrolled out of view.
 */
export function ShowreelHero() {
  const ref = useRef<HTMLVideoElement>(null);
  const section = useRef<HTMLElement>(null);
  const { motionOn } = usePreview();
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(true);
  const autoplay = motionOn && !reduced;

  // Follow the motion switch / reduced motion.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (autoplay && visible) v.play().catch(() => setPlaying(false));
    else if (!autoplay) v.pause();
  }, [autoplay, visible]);

  // Lets the header switch to a light treatment while it sits over the dark reel.
  useEffect(() => {
    document.documentElement.classList.add('has-reel');
    return () => document.documentElement.classList.remove('has-reel');
  }, []);

  // Pause off-screen, resume when back (only if it was autoplaying).
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (!e.isIntersecting) ref.current?.pause();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!showreel) return null;

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => undefined);
  };
  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => undefined);
    else v.pause();
  };

  return (
    <section ref={section} className="reel" aria-label={showreel.title}>
      <video
        ref={ref}
        className="reel__video"
        src={showreel.src}
        poster={showreel.poster}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay={autoplay}
        width={showreel.width}
        height={showreel.height}
        style={{ '--ratio': showreel.width / showreel.height } as React.CSSProperties}
        aria-label={showreel.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="reel__bar">
        <button type="button" className="tag reel__btn" onClick={togglePlay} aria-label={playing ? 'Pause showreel' : 'Play showreel'}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="tag reel__btn" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? 'Sound on' : 'Sound off'}
        </button>
        <span className="reel__label">{showreel.title}</span>
      </div>
    </section>
  );
}
