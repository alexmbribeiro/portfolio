/**
 * The Epistemic Marketplace as the portfolio shows it: a snapshot of debates
 * the real system ran, pulled by `npm run sync`. Nothing here is generated at
 * request time and nothing is written by hand — if a debate is on the page, the
 * running system produced it.
 */
import index from "@/data/marketplace.json";

export type DebateSummary = {
  id: string;
  claim: string;
  category: string;
  createdAt: string;
  mean: number;
  std: number;
  convergence: string | null;
  agentCount: number;
  /** Total belief distance travelled by all agents across the three rounds. */
  swing: number;
  reversals: number;
};

export type RoundPosition = {
  argument: string;
  argumentType: string;
  reasoning: string;
  cruxes: string[];
};

export type DebateAgent = {
  name: string;
  archetype: string;
  beliefs: number[];
  shift: number;
  swing: number;
  reversed: boolean;
  rounds: (RoundPosition | null)[];
  jury: { overall: number; judges: number; comments: { judge: string; comment: string }[] } | null;
};

export type Exchange = { round: number; from: string; to: string; type: string; text: string };

export type Debate = {
  id: string;
  claim: string;
  category: string;
  createdAt: string;
  completedAt: string;
  mean: number;
  std: number;
  convergence: string | null;
  spreadPerRound: number[];
  conclusion: {
    verdict: string;
    reasoning: string;
    consensus: string;
    whatWouldSettleIt: string[];
    modelWritten: boolean;
  } | null;
  agents: DebateAgent[];
  exchanges: Exchange[];
  judges: string[];
};

export type RankRow = {
  name: string;
  archetype: string;
  description: string;
  elo: number;
  debated: number;
  judged: number;
  provisional: boolean;
  criteria: { method: number; engagement: number; cruxes: number; responsive: number; ratings: number } | null;
};

export type Snapshot = {
  syncedAt: string;
  sourceCommit: string | null;
  debates: DebateSummary[];
  ranking: RankRow[];
  judgeSeverity: { judge: string; mean: number; n: number }[];
  faultLines: {
    furthestApart: { a: string; b: string; mean_gap: number; n: number }[];
    closest: { a: string; b: string; mean_gap: number; n: number }[];
  };
};

export const snapshot = index as Snapshot;

export type ClaimGroup = { claim: string; category: string; runs: DebateSummary[] };

/**
 * Debates grouped by claim. Every claim in the snapshot was argued more than
 * once, and the runs do not agree with each other — that variance is shown
 * rather than averaged away.
 */
export function claimGroups(debates: DebateSummary[]): ClaimGroup[] {
  const groups = new Map<string, ClaimGroup>();
  for (const d of debates) {
    const g = groups.get(d.claim) ?? { claim: d.claim, category: d.category, runs: [] };
    g.runs.push(d);
    groups.set(d.claim, g);
  }
  for (const g of groups.values()) g.runs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [...groups.values()];
}

/**
 * The debate the page opens on: the one where minds moved furthest. A replay
 * of six agents who never budged would show the machinery and hide the point.
 */
export function featuredDebate(debates: DebateSummary[]): DebateSummary {
  return [...debates].sort((a, b) => b.swing - a.swing || b.reversals - a.reversals)[0];
}

/** Largest gap between two runs of the same claim, for the variance callout. */
export function runToRunGap(groups: ClaimGroup[]) {
  let widest: { claim: string; a: number; b: number } | null = null;
  for (const g of groups) {
    if (g.runs.length < 2) continue;
    const means = g.runs.map((r) => r.mean);
    const lo = Math.min(...means);
    const hi = Math.max(...means);
    if (!widest || hi - lo > widest.b - widest.a) widest = { claim: g.claim, a: lo, b: hi };
  }
  return widest;
}
