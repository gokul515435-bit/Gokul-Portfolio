import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { PortfolioMedia } from '../data/types';
import type { TileFrame } from '../lib/work-layout';
import { usePreview } from '../lib/preview';
import { useCanHover, usePrefersReducedMotion, useSaveData } from '../lib/hooks';

const HOVER_DELAY = 120;

export type TileProps = {
  id: string;
  media: PortfolioMedia;
  frame: TileFrame;
  href?: string;
  title?: string;
  subtitle?: string;
  placeholder?: boolean;
  priority?: boolean;
};

export function MediaTile({ id, media, frame, href, title, subtitle, placeholder, priority }: TileProps) {
  const { activeId, start, stop, motionOn } = usePreview();
  const canHover = useCanHover();
  const reduced = usePrefersReducedMotion();
  const saveData = useSaveData();
  const hoverPlays = motionOn && canHover && !reduced && !saveData;
  // Touch screens have no hover: previews play by themselves while the tile is on screen
  // (muted, looping). Off when the motion switch is off, with reduced motion, or data saver.
  const autoPlays = motionOn && !canHover && !reduced && !saveData;

  const isVideo = media.type === 'video' && !!(media.preview || media.src);
  const [inView, setInView] = useState(false);
  const active = isVideo && (activeId === id || (autoPlays && inView));
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const timer = useRef<number>();
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Touch autoplay: play while at least half the tile is visible; unmount (and reset) when it leaves.
  useEffect(() => {
    if (!autoPlays || !isVideo || !root.current) {
      setInView(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.5 });
    io.observe(root.current);
    return () => io.disconnect();
  }, [autoPlays, isVideo]);

  // Stop when scrolled off-screen.
  useEffect(() => {
    if (!active || !root.current) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && stop(id), { threshold: 0.05 });
    io.observe(root.current);
    return () => io.disconnect();
  }, [active, id, stop]);

  // Play when mounted as active; unmounting the <video> resets it.
  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play()?.catch(() => {
      /* autoplay blocked or aborted — poster stays visible */
    });
  }, [active]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onEnter = (e: React.PointerEvent) => {
    if (!isVideo || failed || !hoverPlays || e.pointerType !== 'mouse') return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => start(id), HOVER_DELAY);
  };
  const onLeave = () => {
    window.clearTimeout(timer.current);
    if (active) stop(id);
  };

  const fit = media.crop === 'cover' ? 'cover' : 'contain';
  const imgSrc = media.type === 'video' ? media.poster : media.src;
  const vars = { '--r': frame.desktop, '--rm': frame.mobile } as CSSProperties;

  const visual = (
    <div className={`tile__media${frame.letterboxed ? ' is-letterboxed' : ''}`}>
      {imgSrc && (
        <img
          src={imgSrc}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-expect-error fetchpriority is valid HTML but not yet in React 18 types
          fetchpriority={priority ? 'high' : undefined}
          style={{ objectFit: fit, objectPosition: media.focalPoint }}
          onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
        />
      )}
      {active && !failed && (
        <video
          ref={videoRef}
          className={ready ? 'is-ready' : undefined}
          src={media.preview ?? media.src}
          poster={media.poster}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          style={{ objectFit: fit, objectPosition: media.focalPoint }}
          onPlaying={() => setReady(true)}
          onError={() => {
            setFailed(true);
            stop(id);
          }}
        />
      )}
      {placeholder && <span className="tile__tag">Demo</span>}
    </div>
  );

  const caption = (title || subtitle) && (
    <div className="tile__caption">
      {title && <h3 className="tile__title">{title}</h3>}
      {subtitle && <p className="tile__subtitle">{subtitle}</p>}
    </div>
  );

  return (
    <article
      ref={root}
      className={`tile${frame.span === 2 ? ' tile--full' : ''}${active ? ' is-playing' : ''}`}
      style={vars}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {href ? (
        <Link to={href} className="tile__link">
          {visual}
          {caption}
        </Link>
      ) : (
        <div className="tile__link">
          {visual}
          {caption}
        </div>
      )}
      {isVideo && !failed && !autoPlays && (
        <button
          type="button"
          className="tile__play"
          aria-pressed={active}
          aria-label={`${active ? 'Pause' : 'Play'} preview${title ? ` of ${title}` : ''}`}
          onClick={() => (active ? stop(id) : start(id))}
        >
          <span aria-hidden="true">{active ? '❚❚' : '▶'}</span>
          <span>{active ? 'Pause' : 'Preview'}</span>
        </button>
      )}
    </article>
  );
}
