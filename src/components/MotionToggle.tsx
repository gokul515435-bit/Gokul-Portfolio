import { usePreview } from '../lib/preview';

/** The big switch in the left column: turns hover video previews on or off. */
export function MotionToggle() {
  const { motionOn, setMotionOn } = usePreview();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={motionOn}
      aria-label="Motion previews"
      title={motionOn ? 'Motion previews on' : 'Motion previews off'}
      className="switch"
      onClick={() => setMotionOn(!motionOn)}
    >
      <span className="switch__knob" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          {motionOn ? (
            <path d="M15 11.5 L29 20 L15 28.5 Z" />
          ) : (
            <>
              <rect x="13" y="12" width="5" height="16" rx="1" />
              <rect x="22" y="12" width="5" height="16" rx="1" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}
