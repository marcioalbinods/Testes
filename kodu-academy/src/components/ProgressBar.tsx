export function ProgressBar({ value, label, showValue = true }: { value: number; label: string; showValue?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="progress-label">
        <span>{label}</span>
        {showValue && <span>{v}%</span>}
      </div>
      <div className="progress" role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
