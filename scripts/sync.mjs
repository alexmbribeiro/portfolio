#!/usr/bin/env node
/**
 * Pulls recorded debates and the peer-Elo ranking from a running Epistemic
 * Marketplace backend and writes them to data/marketplace.json.
 *
 * Read-only by construction: every request below is a GET. It never creates a
 * debate, so running it cannot pollute the data it is copying.
 *
 *   npm run sync                        # backend on http://127.0.0.1:8000
 *   EM_API=http://host:8000 npm run sync
 *   EM_REPO=../epistemic-marketplace npm run sync   # for the provenance commit
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const API = (process.env.EM_API ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const REPO = resolve(here, "..", process.env.EM_REPO ?? "../epistemic-marketplace");
// The index is imported by the page; each full debate is a static file fetched
// only when a visitor opens it, so the page does not ship all twelve at once.
const INDEX = resolve(here, "..", "data", "marketplace.json");
const DEBATE_DIR = resolve(here, "..", "public", "debates");

async function get(path) {
  let res;
  try {
    res = await fetch(`${API}${path}`);
  } catch {
    throw new Error(
      `Could not reach ${API}. Start the Epistemic Marketplace backend first, or set EM_API.`,
    );
  }
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
  return res.json();
}

function sourceCommit() {
  try {
    return execFileSync("git", ["-C", REPO, "rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

const round2 = (n) => Math.round(n * 100) / 100;
const text = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

function compactDebate(d) {
  const s = d.synthesis ?? {};
  const positions = s.positions ?? {};
  const rounds = ["round1", "round2", "round3"].map((r) => positions[r] ?? []);
  const scores = s.jury?.scores ?? {};

  const agents = (s.trajectory?.agents ?? []).map((t) => {
    const perRound = rounds.map((round) => round.find((p) => p.agent_name === t.agent_name));
    const jury = scores[t.agent_name];
    return {
      name: t.agent_name,
      archetype: t.archetype,
      beliefs: t.beliefs.map(round2),
      shift: round2(t.shift),
      swing: round2(t.swing),
      reversed: Boolean(t.reversed),
      // Confidence intervals are deliberately not copied: in about a third of
      // stored positions the model's interval does not contain its own
      // belief_score, so drawing them would present noise as uncertainty.
      rounds: perRound.map((p) =>
        p
          ? {
              argument: text(p.argument_content),
              argumentType: text(p.argument_type),
              reasoning: text(p.reasoning),
              cruxes: (p.cruxes ?? []).map(text),
            }
          : null,
      ),
      jury: jury
        ? {
            overall: round2(jury.overall),
            judges: jury.judges,
            comments: (jury.comments ?? []).map((c) => ({
              judge: text(c.judge),
              comment: text(c.comment),
            })),
          }
        : null,
    };
  });

  return {
    id: d.id,
    claim: text(d.claim_content),
    category: text(d.claim_category),
    createdAt: d.created_at,
    completedAt: d.completed_at,
    mean: round2(d.final_belief_distribution?.mean ?? 0.5),
    std: round2(d.final_belief_distribution?.std ?? 0),
    convergence: s.trajectory?.convergence ?? null,
    spreadPerRound: (s.trajectory?.spread_per_round ?? []).map(round2),
    conclusion: s.conclusion
      ? {
          verdict: text(s.conclusion.verdict),
          reasoning: text(s.conclusion.reasoning),
          consensus: text(s.conclusion.consensus),
          whatWouldSettleIt: (s.conclusion.what_would_settle_it ?? []).map(text),
          // true: written by the synthesist model pass.
          // false: the numeric fallback used when that pass failed.
          modelWritten: s.conclusion.generated === true,
        }
      : null,
    agents,
    exchanges: (s.exchanges ?? []).map((e) => ({
      round: e.round,
      from: text(e.from_agent),
      to: text(e.to_agent),
      type: text(e.type),
      text: text(e.text),
    })),
    judges: (s.jury?.judges ?? []).map((j) => j.name),
  };
}

function judgeSeverity(pairs) {
  const by = new Map();
  for (const { judge, mean_score, n } of pairs) {
    const acc = by.get(judge) ?? { sum: 0, n: 0 };
    acc.sum += mean_score * n;
    acc.n += n;
    by.set(judge, acc);
  }
  return [...by]
    .map(([judge, { sum, n }]) => ({ judge, mean: Math.round((sum / n) * 10) / 10, n }))
    .sort((a, b) => a.mean - b.mean);
}

const [debates, leaderboard, bias, faultLines] = await Promise.all([
  get("/debates/"),
  get("/calibration/leaderboard"),
  get("/calibration/judge-bias"),
  get("/calibration/fault-lines"),
]);

const completed = debates
  .filter((d) => d.status === "completed" && d.synthesis?.positions)
  .sort((a, b) => a.created_at.localeCompare(b.created_at));

const full = completed.map(compactDebate);

const index = {
  syncedAt: new Date().toISOString(),
  sourceCommit: sourceCommit(),
  debates: full.map((d) => ({
    id: d.id,
    claim: d.claim,
    category: d.category,
    createdAt: d.createdAt,
    mean: d.mean,
    std: d.std,
    convergence: d.convergence,
    agentCount: d.agents.length,
    swing: round2(d.agents.reduce((acc, a) => acc + a.swing, 0)),
    reversals: d.agents.filter((a) => a.reversed).length,
  })),
  ranking: leaderboard.map((a) => ({
    name: a.name,
    archetype: a.archetype,
    description: text(a.description),
    elo: Math.round(a.elo_rating * 10) / 10,
    debated: a.debates_rated_in,
    judged: a.debates_judged,
    provisional: Boolean(a.provisional),
    criteria: a.criteria
      ? {
          method: Math.round(a.criteria.method_fidelity),
          engagement: Math.round(a.criteria.engagement),
          cruxes: Math.round(a.criteria.crux_quality),
          responsive: Math.round(a.criteria.responsiveness),
          ratings: a.criteria.ratings_received,
        }
      : null,
  })),
  judgeSeverity: judgeSeverity(bias),
  faultLines: {
    furthestApart: faultLines.furthest_apart ?? [],
    closest: faultLines.closest ?? [],
  },
};

mkdirSync(dirname(INDEX), { recursive: true });
mkdirSync(DEBATE_DIR, { recursive: true });

// This directory belongs to the sync: anything not in the current set is a
// debate that no longer exists upstream, and is removed so the site cannot
// keep serving it.
const keep = new Set(full.map((d) => `${d.id}.json`));
for (const f of readdirSync(DEBATE_DIR)) {
  if (f.endsWith(".json") && !keep.has(f)) unlinkSync(resolve(DEBATE_DIR, f));
}
for (const d of full) {
  writeFileSync(resolve(DEBATE_DIR, `${d.id}.json`), JSON.stringify(d) + "\n");
}
writeFileSync(INDEX, JSON.stringify(index, null, 1) + "\n");

const kb = (o) => (Buffer.byteLength(JSON.stringify(o)) / 1024).toFixed(0);
console.log(
  `Synced ${full.length} debates and ${index.ranking.length} ranked agents from ${API}` +
    `${index.sourceCommit ? ` @ ${index.sourceCommit}` : ""}\n` +
    `  data/marketplace.json   ${kb(index)} KB (index, imported by the page)\n` +
    `  public/debates/*.json   ${kb(full)} KB (${full.length} files, fetched on demand)`,
);
