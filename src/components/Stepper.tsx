export type StepperTone = "neutral" | "gold" | "nitra" | "hp" | "danger";
export type StepperSize = "md" | "lg";

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  tone?: StepperTone;
  size?: StepperSize;
  /** Show the "/ max" sublabel. */
  showMax?: boolean;
  /** Accessible label suffix, e.g. "Boomstick integrity". */
  label?: string;
}

function toneColor(tone: StepperTone, pct: number): string {
  switch (tone) {
    case "gold":
      return "var(--gold)";
    case "nitra":
      return "var(--nitra)";
    case "danger":
      return "var(--danger)";
    case "hp":
      if (pct <= 25) return "var(--danger)";
      if (pct <= 50) return "var(--gold)";
      return "var(--ok)";
    default:
      return "var(--text)";
  }
}

const MinusGlyph = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="4" y="10.7" width="16" height="2.6" rx="1.3" />
  </svg>
);
const PlusGlyph = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="4" y="10.7" width="16" height="2.6" rx="1.3" />
    <rect x="10.7" y="4" width="2.6" height="16" rx="1.3" />
  </svg>
);

/** Signature +/- control. Large touch targets, tabular numerals, integrated
 * HP bar (green→amber→red), disabled at bounds, amber focus ring. */
export function Stepper({
  value,
  min = 0,
  max = 99,
  step = 1,
  onChange,
  tone = "neutral",
  size = "lg",
  showMax = false,
  label = "value"
}: StepperProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  const color = toneColor(tone, pct);
  const glyph = size === "lg" ? 24 : 20;
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <div className={`stepper ${size}`} role="group" aria-label={label}>
      <button
        type="button"
        className="stepper-btn dec"
        disabled={decDisabled}
        onClick={() => onChange(Math.max(min, value - step))}
        aria-label={`decrease ${label}`}
      >
        <MinusGlyph s={glyph} />
      </button>
      <div className="stepper-readout">
        <div className="stepper-value" style={{ color }}>
          {value}
        </div>
        {showMax && <div className="stepper-max">/ {max}</div>}
        {tone === "hp" && (
          <div className="stepper-bar">
            <div style={{ width: `${pct}%`, background: color }} />
          </div>
        )}
      </div>
      <button
        type="button"
        className="stepper-btn inc"
        disabled={incDisabled}
        onClick={() => onChange(Math.min(max, value + step))}
        aria-label={`increase ${label}`}
      >
        <PlusGlyph s={glyph} />
      </button>
    </div>
  );
}
