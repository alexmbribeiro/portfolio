/**
 * Diverging colour for a probability.
 *
 * 0.5 means "no signal" and resolves to the neutral grey; distance from the
 * midpoint mixes toward the true (blue) or false (red) pole. Mixing happens in
 * OKLab and is eased, so 0.62 reads as meaningfully blue while 0.50 stays
 * exactly neutral.
 */
export function beliefColor(v: number): string {
  const pole = v >= 0.5 ? "var(--belief-true)" : "var(--belief-false)";
  const pct = Math.round(Math.pow(Math.abs(v - 0.5) / 0.5, 0.6) * 100);
  return `color-mix(in oklab, ${pole} ${pct}%, var(--belief-neutral))`;
}

export function fmt(v: number): string {
  return v.toFixed(2);
}

/**
 * A belief as a bar diverging from the 0.5 midpoint. The number is always
 * printed — colour is never the only channel.
 */
export function BeliefMeter({ value, label = "belief" }: { value: number; label?: string }) {
  const fromCenter = Math.abs(value - 0.5) * 100;
  const left = value >= 0.5 ? 50 : 50 - fromCenter;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">{label}</span>
        <span className="nums font-mono text-sm text-ink">{fmt(value)}</span>
      </div>
      <div className="relative mt-2 h-2 w-full rounded-full bg-surface-2">
        <div
          className="absolute inset-y-[-3px] left-1/2 w-px -translate-x-1/2"
          style={{ background: "var(--border-strong)" }}
        />
        <div
          className="absolute inset-y-0 rounded-[4px] transition-[width,left] duration-700"
          style={{ left: `${left}%`, width: `${Math.max(fromCenter, 0.6)}%`, background: beliefColor(value) }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-3">
        <span>false</span>
        <span>uncertain</span>
        <span>true</span>
      </div>
    </div>
  );
}

/**
 * One agent's path across the rounds on a shared 0–1 axis.
 *
 * Earlier rounds stay as faint dots joined by a line, and the live dot slides
 * to its new position when the round advances — so a reversal is something
 * you watch happen, not a number you have to compare.
 */
export function BeliefTrack({ beliefs, round }: { beliefs: number[]; round: number }) {
  const shown = beliefs.slice(0, round + 1);
  const current = shown[shown.length - 1];
  const lo = Math.min(...shown);
  const hi = Math.max(...shown);

  return (
    <div className="relative h-5 w-full" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-border-strong" />

      {/* Ground covered so far */}
      <div
        className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-border-strong transition-[left,width] duration-700"
        style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }}
      />

      {shown.slice(0, -1).map((b, i) => (
        <div
          key={i}
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{ left: `${b * 100}%`, background: beliefColor(b) }}
        />
      ))}

      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--surface)] transition-[left,background-color] duration-700"
        style={{ left: `${current * 100}%`, background: beliefColor(current) }}
      />
    </div>
  );
}
