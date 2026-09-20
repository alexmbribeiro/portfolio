import type { BeliefDistribution } from "@/lib/debate";

/**
 * Diverging colour for a probability.
 *
 * 0.5 means "no signal" and resolves to the neutral grey; distance from the
 * midpoint mixes toward the true (blue) or false (red) pole. Mixing happens in
 * OKLab so the ramp is perceptually even rather than bunching in the middle.
 */
export function beliefColor(v: number): string {
  const pole = v >= 0.5 ? "var(--belief-true)" : "var(--belief-false)";
  const pct = Math.round(Math.pow(Math.abs(v - 0.5) / 0.5, 0.6) * 100);
  return `color-mix(in oklab, ${pole} ${pct}%, var(--belief-neutral))`;
}

/** Drawable height of the histogram plot area, inside the h-28 container. */
const BAR_AREA_PX = 76;

export function fmt(v: number): string {
  return v.toFixed(2);
}

/**
 * A single agent's belief, as a bar diverging from the 0.5 midpoint, with the
 * agent's stated confidence interval behind it. The number is always printed —
 * colour is never the only channel.
 */
export function BeliefMeter({
  value,
  low,
  high,
  label = "belief",
}: {
  value: number;
  low?: number;
  high?: number;
  label?: string;
}) {
  const fromCenter = Math.abs(value - 0.5) * 100;
  const left = value >= 0.5 ? 50 : 50 - fromCenter;

  const hasInterval =
    typeof low === "number" && typeof high === "number" && high > low;
  const ciLeft = hasInterval ? Math.min(low!, high!) * 100 : 0;
  const ciWidth = hasInterval ? Math.abs(high! - low!) * 100 : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          {label}
        </span>
        <span className="nums font-mono text-sm text-ink">
          {fmt(value)}
          {hasInterval && (
            <span className="text-ink-3">
              {" "}
              [{fmt(low!)}–{fmt(high!)}]
            </span>
          )}
        </span>
      </div>

      <div className="relative mt-2 h-2 w-full rounded-full bg-surface-2">
        {/* Confidence interval: the agent's own stated uncertainty. */}
        {hasInterval && (
          <div
            className="absolute inset-y-0 rounded-full opacity-30"
            style={{
              left: `${ciLeft}%`,
              width: `${ciWidth}%`,
              background: beliefColor(value),
            }}
          />
        )}
        {/* The midpoint is the baseline this bar is anchored to. */}
        <div
          className="absolute inset-y-[-3px] left-1/2 w-px -translate-x-1/2"
          style={{ background: "var(--border-strong)" }}
        />
        <div
          className="absolute inset-y-0 rounded-[4px] transition-[width,left] duration-500"
          style={{
            left: `${left}%`,
            width: `${Math.max(fromCenter, 0.6)}%`,
            background: beliefColor(value),
          }}
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
 * Where the six landed. A histogram is the right form here: the shape of the
 * spread is the finding, and a single averaged number would destroy it.
 */
export function BeliefDistributionChart({ d }: { d: BeliefDistribution }) {
  const max = Math.max(...d.buckets.map((b) => b.count), 1);
  const direction =
    d.mean > 0.6 ? "leans true" : d.mean < 0.4 ? "leans false" : "no consensus";

  return (
    <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="font-display text-xl text-ink">Aggregated belief</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          {d.agentCount} agents · {direction}
        </span>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="nums flex items-baseline gap-2">
            <span className="font-display text-5xl leading-none text-ink">
              {fmt(d.mean)}
            </span>
            <span className="font-mono text-xs text-ink-3">± {fmt(d.std)}</span>
          </div>
          <p className="mt-2 text-sm text-ink-2">
            Mean belief across the six, with the standard deviation of their
            disagreement.
          </p>
          <div className="mt-4">
            <BeliefMeter value={d.mean} label="aggregate" />
          </div>
        </div>

        {/* Histogram: counts per belief bucket, coloured by position on the scale. */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Distribution
          </span>
          <div className="mt-3 flex h-28 items-stretch gap-[2px]">
            {d.buckets.map((b) => (
              <div key={b.range} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="nums font-mono text-[10px] text-ink-2">
                  {b.count || ""}
                </span>
                <div
                  className="w-full rounded-t-[4px]"
                  style={{
                    height: `${b.count ? Math.max((b.count / max) * BAR_AREA_PX, 6) : 2}px`,
                    background: b.count
                      ? beliefColor(bucketMidpoint(b.range))
                      : "var(--surface-2)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="nums mt-1.5 flex justify-between font-mono text-[9px] text-ink-3">
            {["0.0", "0.2", "0.4", "0.6", "0.8", "1.0"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Zone of disagreement
          </span>
          <p className="mt-1 text-sm text-ink-2">{d.disagreementZone}</p>
        </div>
        {d.uniformWeights && (
          <p className="text-xs text-ink-3">
            LMSR weighting is uniform here: weights come from reputation earned
            over past calibration, and a one-shot debate has no track record to
            draw on. The weighted mean therefore equals the plain mean, and
            saying so is cheaper than implying a sophistication that is not
            present.
          </p>
        )}
      </div>
    </div>
  );
}

function bucketMidpoint(range: string): number {
  const [lo, hi] = range.split("–").map(Number);
  return (lo + hi) / 2;
}
