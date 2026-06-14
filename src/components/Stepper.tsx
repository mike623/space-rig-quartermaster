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
  /** Show discrete pips (one per unit). Auto-on for hp tone. */
  showPips?: boolean;
  /** Accessible label suffix, e.g. "Boomstick integrity". */
  label?: string;
}

/** Max units we render as discrete pips before falling back to a number only. */
const PIP_LIMIT = 12;

function readoutColor(tone: StepperTone, pct: number, value: number): string {
  switch (tone) {
    case "gold":
      return "var(--gold)";
    case "nitra":
      return "var(--nitra)";
    case "danger":
      return "var(--danger)";
    case "hp":
      if (pct <= 0.25 || value <= 1) return "var(--danger)";
      if (pct <= 0.5) return "var(--gold)";
      return "var(--ok)";
    default:
      return "var(--text)";
  }
}

/** Per-pip fill color. HP shifts green→amber→red; ammo (neutral) reds out low. */
function pipColor(tone: StepperTone, pct: number, value: number): string {
  if (tone === "hp") {
    if (pct <= 0.25 || value <= 1) return "var(--danger)";
    if (pct <= 0.5) return "var(--gold)";
    return "var(--ok)";
  }
  if (tone === "gold") return "var(--gold)";
  if (tone === "nitra") return "var(--nitra)";
  if (tone === "danger") return "var(--danger)";
  return pct <= 0.25 ? "var(--danger)" : "#cdd4df";
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

/** Signature +/- control. Large touch targets, tabular numerals, discrete pip
 * meter for small ranges (clearer than a thin bar), disabled at bounds,
 * amber focus ring. */
export function Stepper({
  value,
  min = 0,
  max = 99,
  step = 1,
  onChange,
  tone = "neutral",
  size = "lg",
  showMax = false,
  showPips = false,
  label = "value"
}: StepperProps) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const color = readoutColor(tone, pct, value);
  const glyph = size === "lg" ? 24 : 20;
  const decDisabled = value <= min;
  const incDisabled = value >= max;
  const usePips = (showPips || tone === "hp") && max > 0 && max <= PIP_LIMIT;
  const fill = pipColor(tone, pct, value);

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
        {usePips && (
          <div className="stepper-pips" aria-hidden="true">
            {Array.from({ length: max }, (_, i) => (
              <span
                key={i}
                className="pip"
                style={{ background: i < value ? fill : "#20252f" }}
              />
            ))}
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
