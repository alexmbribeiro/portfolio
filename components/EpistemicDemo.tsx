import type { ClaimGroup, Debate, Snapshot } from "@/lib/marketplace";
import { DebateReplay } from "./DebateReplay";
import { Ranking } from "./Ranking";

/**
 * Recorded Epistemic Marketplace debates, framed as a device inside the
 * project's entry — one project among several, not the front door.
 */
export function EpistemicDemo({
  snapshot,
  groups,
  initial,
  gap,
}: {
  snapshot: Snapshot;
  groups: ClaimGroup[];
  initial: Debate;
  gap: { claim: string; a: number; b: number } | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-strong">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-border bg-surface px-5 py-3 sm:px-7">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
          Epistemic Marketplace
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          Recorded debates · replayed
        </span>
      </div>

      <div className="px-5 py-7 sm:px-7 sm:py-9">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <p className="max-w-2xl text-[14px] leading-relaxed text-ink-2">
            These are debates the system actually ran, copied from it rather
            than written for this page. Pick a claim, or watch the one where
            the agents moved furthest.
          </p>
          {gap && (
            <p className="text-[13px] leading-relaxed text-ink-3 lg:border-l lg:border-border lg:pl-5">
              Every claim here was argued twice, and the runs do not agree.
              &ldquo;{gap.claim}&rdquo; landed at{" "}
              <span className="nums text-ink">{gap.a.toFixed(2)}</span> once and{" "}
              <span className="nums text-ink">{gap.b.toFixed(2)}</span> the next.
              That variance is part of the result.
            </p>
          )}
        </div>

        <DebateReplay groups={groups} initial={initial} />

        <div className="mt-14 border-t border-border pt-8">
          <div className="mb-6 max-w-2xl">
            <h4 className="font-display text-2xl text-ink">Who argued best</h4>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
              After each debate, three philosophers who took no part score every
              debater on craft — did it hold to its own method, engage what was
              actually said, offer cruxes that could really fail, move only when
              given a reason — and never on whether they agreed. Those scores
              become pairwise results inside the debate and move an Elo from
              1500. Nothing here measures being right.
            </p>
          </div>
          <Ranking snapshot={snapshot} />
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-3">
          Synced {snapshot.syncedAt.slice(0, 10)}
          {snapshot.sourceCommit && <> from commit {snapshot.sourceCommit}</>} ·{" "}
          <a
            href="https://github.com/alexmbribeiro/epistemic-marketplace"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink"
          >
            source on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
