import type { Archetype } from "./agents";

/** Mirrors POSITION_SCHEMA from the Python service. */
export type Position = {
  belief_score: number;
  confidence_low: number;
  confidence_high: number;
  reasoning: string;
  key_evidence: string[];
  cruxes: string[];
  argument_type: "supports" | "contradicts" | "qualifies" | "redefines" | "uncertain";
  argument_content: string;
  argument_strength: number;
  unanswered_questions: string[];
};

export type AgentPosition = Position & {
  archetype: Archetype;
  agent_name: string;
};

export type Bucket = { range: string; count: number; pct: number };

export type BeliefDistribution = {
  mean: number;
  weightedMean: number;
  std: number;
  buckets: Bucket[];
  dominantAgents: { agentName: string; beliefScore: number; weight: number }[];
  disagreementZone: string;
  agentCount: number;
  /** True when every agent carries the same weight because no track record exists yet. */
  uniformWeights: boolean;
};

/** Reputation → LMSR market weight. Port of `lmsr_weight` in aggregator.py. */
export function lmsrWeight(reputation: number): number {
  return Math.log1p(reputation);
}

const BUCKET_LABELS = ["0.0–0.2", "0.2–0.4", "0.4–0.6", "0.6–0.8", "0.8–1.0"];

/**
 * Port of `compute_belief_distribution` in aggregator.py.
 *
 * In the full system each agent carries a reputation earned from past
 * calibration, and LMSR weighting makes the well-calibrated agents count for
 * more. Here there is no history, so every reputation is 1.0 and the weighted
 * mean necessarily equals the plain mean — the UI says so rather than implying
 * a sophistication that is not there.
 */
export function computeBeliefDistribution(
  positions: AgentPosition[],
  reputationMap: Record<string, number> = {},
): BeliefDistribution {
  if (positions.length === 0) {
    return {
      mean: 0.5, weightedMean: 0.5, std: 0, buckets: [], dominantAgents: [],
      disagreementZone: "No specific crux identified", agentCount: 0, uniformWeights: true,
    };
  }

  const weights = positions.map((p) => lmsrWeight(reputationMap[p.archetype] ?? 1.0));
  const beliefs = positions.map((p) => p.belief_score);

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedMean =
    beliefs.reduce((acc, b, i) => acc + b * weights[i], 0) / totalWeight;

  const mean = beliefs.reduce((a, b) => a + b, 0) / beliefs.length;
  const variance =
    beliefs.reduce((acc, b) => acc + (b - mean) ** 2, 0) / beliefs.length;
  const std = Math.sqrt(variance);

  const counts = [0, 0, 0, 0, 0];
  for (const b of beliefs) counts[Math.min(Math.floor(b * 5), 4)] += 1;
  const buckets: Bucket[] = BUCKET_LABELS.map((range, i) => ({
    range,
    count: counts[i],
    pct: counts[i] / beliefs.length,
  }));

  // Agents pulling hardest away from 0.5 carry the distribution.
  const dominantAgents = positions
    .map((p, i) => ({ p, w: weights[i] }))
    .sort((a, b) =>
      Math.abs(b.p.belief_score - 0.5) * b.w - Math.abs(a.p.belief_score - 0.5) * a.w)
    .slice(0, 3)
    .map(({ p, w }) => ({ agentName: p.agent_name, beliefScore: p.belief_score, weight: w }));

  const allCruxes = positions.flatMap((p) => p.cruxes);
  const uniqueWeights = new Set(weights.map((w) => w.toFixed(6)));

  return {
    mean: round(mean),
    weightedMean: round(weightedMean),
    std: round(std),
    buckets,
    dominantAgents,
    disagreementZone: allCruxes[0] ?? "Multiple competing frameworks",
    agentCount: positions.length,
    uniformWeights: uniqueWeights.size === 1,
  };
}

const round = (n: number) => Math.round(n * 1e4) / 1e4;

/** Server-sent event payloads streamed by /api/debate. */
export type DebateEvent =
  | { type: "start"; claim: string; agents: { archetype: Archetype; name: string }[] }
  | { type: "position"; position: AgentPosition }
  | { type: "agent_error"; archetype: Archetype; message: string }
  | { type: "aggregate"; distribution: BeliefDistribution }
  | { type: "done" }
  | { type: "error"; message: string };
