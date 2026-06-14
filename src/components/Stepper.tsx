interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  suffix?: string;
}

/** Large +/- control for table use (44px+ touch targets). */
export function Stepper({
  value,
  min = 0,
  max = 999,
  step = 1,
  onChange,
  suffix
}: StepperProps) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div className="stepper" role="group" aria-label="adjust value">
      <button type="button" onClick={dec} disabled={value <= min} aria-label="decrease">
        −
      </button>
      <span className="val">
        {value}
        {suffix ? <span className="muted"> {suffix}</span> : null}
      </span>
      <button type="button" onClick={inc} disabled={value >= max} aria-label="increase">
        +
      </button>
    </div>
  );
}
