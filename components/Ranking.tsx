import type { Snapshot } from "@/lib/marketplace";

/**
 * The peer-Elo ranking, as the system computes it. Rendered on the server from
 * the synced snapshot — there is no interaction here worth shipping JS for.
 */
export function Ranking({ snapshot }: { snapshot: Snapshot }) {
  const { ranking, judgeSeverity, faultLines, debates } = snapshot;
  const harshest = judgeSeverity[0];
  const kindest = judgeSeverity[judgeSeverity.length - 1];
  const fewest = Math.min(...ranking.map((r) => r.debated));
  const most = Math.max(...ranking.map((r) => r.debated));
  const debatedRange = fewest === most ? String(fewest) : `${fewest}–${most}`;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="nums w-full min-w-[640px] text-left text-[13px]">
          <caption className="sr-only">
            Peer Elo ranking of the fourteen philosopher agents, with mean craft scores by criterion
          </caption>
          <thead>
            <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
              <th className="py-3 pl-4 pr-2 font-normal">#</th>
              <th className="px-2 font-normal">Agent</th>
              <th className="px-2 text-right font-normal">Elo</th>
              <th className="px-2 text-right font-normal">vs 1500</th>
              <th className="px-2 text-right font-normal">Method</th>
              <th className="px-2 text-right font-normal">Engage</th>
              <th className="px-2 text-right font-normal">Cruxes</th>
              <th className="py-3 pl-2 pr-4 text-right font-normal">Responsive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ranking.map((r, i) => {
              // Half-points round away from zero, matching the system's own ranking page.
              const raw = r.elo - 1500;
              const delta = Math.sign(raw) * Math.round(Math.abs(raw));
              return (
                <tr key={r.name} className="text-ink-2">
                  <td className="py-2.5 pl-4 pr-2 text-ink-3">{i + 1}</td>
                  <td className="px-2">
                    <span className="text-ink">{r.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-ink-3">{r.archetype}</span>
                  </td>
                  <td className="px-2 text-right text-ink">{Math.round(r.elo)}</td>
                  <td className="px-2 text-right font-mono text-[12px] text-ink-3">
                    {delta > 0 ? "+" : delta < 0 ? "−" : "±"}
                    {Math.abs(delta)}
                  </td>
                  <td className="px-2 text-right">{r.criteria?.method ?? "—"}</td>
                  <td className="px-2 text-right">{r.criteria?.engagement ?? "—"}</td>
                  <td className="px-2 text-right">{r.criteria?.cruxes ?? "—"}</td>
                  <td className="py-2.5 pl-2 pr-4 text-right">{r.criteria?.responsive ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-ink-3">
        {debates.length} debates; each agent argued in {debatedRange} of them. These numbers are thin
        and the system says so.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            The judges judged
          </span>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
            A philosopher scoring philosophers brings its school with it, so severity is published
            rather than hidden. {harshest.judge} hands out a mean of {Math.round(harshest.mean)};{" "}
            {kindest.judge}, {Math.round(kindest.mean)}.
          </p>
          <p className="nums mt-3 font-mono text-[11px] leading-relaxed text-ink-3">
            {judgeSeverity.map((j) => `${j.judge} ${Math.round(j.mean)}`).join(" · ")}
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Furthest apart
          </span>
          <ul className="nums mt-2 space-y-1 text-[13px] text-ink-2">
            {faultLines.furthestApart.slice(0, 4).map((f) => (
              <li key={`${f.a}-${f.b}`} className="flex justify-between gap-3">
                <span>
                  {f.a} · {f.b}
                </span>
                <span className="font-mono text-[11px] text-ink-3">
                  {Math.round(f.mean_gap * 100)} pts · n={f.n}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Closest together
          </span>
          <ul className="nums mt-2 space-y-1 text-[13px] text-ink-2">
            {faultLines.closest.slice(0, 4).map((f) => (
              <li key={`${f.a}-${f.b}`} className="flex justify-between gap-3">
                <span>
                  {f.a} · {f.b}
                </span>
                <span className="font-mono text-[11px] text-ink-3">
                  {Math.round(f.mean_gap * 100)} pts · n={f.n}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
