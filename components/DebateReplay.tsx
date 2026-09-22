"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ClaimGroup, Debate, DebateAgent } from "@/lib/marketplace";
import { BeliefMeter, BeliefTrack, fmt } from "./Belief";

const STEPS = [
  {
    label: "Alone",
    detail: "Each agent reads the claim and takes a position without seeing anyone else's.",
  },
  {
    label: "Cross-examination",
    detail:
      "Each sees the whole room — every position and every crux — and challenges, by name, the agents it disagrees with.",
  },
  {
    label: "Final",
    detail: "Each revises once more after the cross-examination.",
  },
  {
    label: "Verdict",
    detail:
      "A separate pass reads the final positions and says what the debate concluded — and three philosophers who took no part score each debater's craft.",
  },
] as const;

const VERDICT = 3;
const STEP_MS = 2800;

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const spread = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

export function DebateReplay({
  groups,
  initial,
}: {
  groups: ClaimGroup[];
  initial: Debate;
}) {
  const cache = useRef(new Map<string, Debate>([[initial.id, initial]]));
  const [debate, setDebate] = useState<Debate>(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  // Replays once through the rounds and comes to rest on the verdict. Any
  // interaction hands control to the reader. With reduced motion there is no
  // replay at all: the debate opens on its outcome.
  const animating = playing && step < VERDICT;
  useEffect(() => {
    if (!animating) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setStep(reduced ? VERDICT : step + 1), reduced ? 0 : STEP_MS);
    return () => clearTimeout(t);
  }, [animating, step]);

  const select = useCallback(async (id: string) => {
    if (id === debate.id) return;
    let next = cache.current.get(id);
    if (!next) {
      setLoadingId(id);
      try {
        const res = await fetch(`/debates/${id}.json`);
        if (!res.ok) throw new Error(String(res.status));
        next = (await res.json()) as Debate;
        cache.current.set(id, next);
      } catch {
        setLoadingId(null);
        return;
      }
      setLoadingId(null);
    }
    setDebate(next);
    setOpen(null);
    setStep(0);
    setPlaying(true);
  }, [debate.id]);

  const goTo = (s: number) => {
    setPlaying(false);
    setStep(s);
  };

  // Rows stay in final-belief order for the whole replay, so the dots move and
  // the rows do not — reordering every round would hide the movement.
  const agents = useMemo(
    () => [...debate.agents].sort((a, b) => a.beliefs[2] - b.beliefs[2]),
    [debate],
  );

  const round = Math.min(step, 2);
  const roomBeliefs = agents.map((a) => a.beliefs[round]);
  const roomMean = mean(roomBeliefs);
  const roomSpread = spread(roomBeliefs);

  const exchanges = debate.exchanges.filter((e) => e.round === 2);

  return (
    <div>
      {/* ── Claim picker ───────────────────────────────────────────── */}
      {/* On a phone six stacked cards would push the replay out of view while
          it plays, so the picker scrolls sideways there instead. */}
      <div className="-mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.claim}
            className={`w-[78%] shrink-0 snap-start rounded-lg border p-3 transition-colors sm:w-auto ${
              g.runs.some((r) => r.id === debate.id)
                ? "border-border-strong bg-surface"
                : "border-border"
            }`}
          >
            <p className="text-[13px] leading-snug text-ink">{g.claim}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {g.runs.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => select(r.id)}
                  aria-pressed={r.id === debate.id}
                  className={`nums rounded-full border px-2.5 py-0.5 font-mono text-[10px] transition-colors ${
                    r.id === debate.id
                      ? "border-border-strong bg-surface-2 text-ink"
                      : "border-border text-ink-3 hover:text-ink"
                  }`}
                >
                  {loadingId === r.id ? "loading…" : `run ${i + 1} · ${fmt(r.mean)}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── The debate ─────────────────────────────────────────────── */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="max-w-3xl font-display text-xl leading-snug text-ink sm:text-2xl">
            “{debate.claim}”
          </p>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            recorded {debate.createdAt.slice(0, 10)} · {debate.agents.length} agents
          </span>
        </div>

        {/* Step control */}
        <ol className="mt-6 grid grid-cols-4 gap-1" aria-label="Debate stages">
          {STEPS.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={step === i ? "step" : undefined}
                className="group w-full text-left"
              >
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full bg-ink-2 ${
                      step > i ? "w-full" : step === i ? (animating ? "animate-[fill_2800ms_linear_both]" : "w-full") : "w-0"
                    }`}
                  />
                </div>
                <span
                  className={`mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    step === i ? "text-ink" : "text-ink-3 group-hover:text-ink-2"
                  }`}
                >
                  <span className="hidden sm:inline">{i < 3 ? `Round ${i + 1} · ` : ""}</span>
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 min-h-[2.5rem] max-w-2xl text-[13px] leading-relaxed text-ink-3">
          {STEPS[step].detail}
        </p>

        {/* Agents */}
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {agents.map((a) => (
            <AgentRow
              key={a.name}
              agent={a}
              step={step}
              open={open === a.name}
              onToggle={() => {
                setPlaying(false);
                setOpen((o) => (o === a.name ? null : a.name));
              }}
            />
          ))}
        </ul>

        {/* The room */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-border bg-surface p-5">
            <BeliefMeter value={roomMean} label={`the room · round ${round + 1}`} />
            <p className="nums mt-3 text-[13px] text-ink-3">
              Spread by round:{" "}
              {debate.spreadPerRound.map((s, i) => (
                <span key={i} className={i === round ? "text-ink" : undefined}>
                  {i > 0 && " → "}
                  {fmt(s)}
                </span>
              ))}
              {debate.convergence && <> · {debate.convergence}</>}
            </p>
            <p className="nums mt-1 text-[13px] text-ink-3">
              This round: mean {fmt(roomMean)}, spread {fmt(roomSpread)}.
            </p>
          </div>

          {step === 1 && exchanges.length > 0 && <Exchanges items={exchanges} />}
          {step === VERDICT && debate.conclusion && <Conclusion debate={debate} />}
          {step !== 1 && step !== VERDICT && (
            <div className="hidden rounded-lg border border-dashed border-border p-5 text-[13px] text-ink-3 lg:block">
              {step === 0
                ? "No agent has seen another yet. Watch which dots move once they do."
                : `${exchanges.length} challenges were issued in the cross-examination. Open an agent to read what it concluded.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentRow({
  agent,
  step,
  open,
  onToggle,
}: {
  agent: DebateAgent;
  step: number;
  open: boolean;
  onToggle: () => void;
}) {
  const round = Math.min(step, 2);
  const pos = agent.rounds[round];
  const belief = agent.beliefs[round];
  const moved = round > 0 ? belief - agent.beliefs[round - 1] : 0;
  const verdict = step === VERDICT;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3.5 text-left sm:grid-cols-[150px_minmax(0,1fr)_88px]"
      >
        <span className="min-w-0">
          <span className="block font-display text-[17px] leading-none text-ink">{agent.name}</span>
          <span className="mt-1 block font-mono text-[10px] text-ink-3">{agent.archetype}</span>
        </span>

        <span className="nums text-right font-mono text-sm text-ink sm:order-last">
          {fmt(belief)}
          <span className="block text-[10px] text-ink-3">
            {verdict && agent.jury
              ? `craft ${Math.round(agent.jury.overall)}`
              : round > 0 && Math.abs(moved) >= 0.005
                ? `${moved > 0 ? "+" : "−"}${fmt(Math.abs(moved))}`
                : round > 0
                  ? "held"
                  : " "}
          </span>
        </span>

        <span className="col-span-2 sm:col-span-1">
          <BeliefTrack beliefs={agent.beliefs} round={round} />
        </span>
      </button>

      {pos?.argument && (
        <p className="-mt-1 pb-3.5 text-[13px] leading-relaxed text-ink-2 sm:pl-[166px] sm:pr-[104px]">
          {pos.argument}
        </p>
      )}

      {open && (
        <div className="space-y-4 pb-5 text-[13px] leading-relaxed sm:pl-[166px] sm:pr-[104px]">
          {pos?.reasoning && (
            <Block title={`Reasoning · round ${round + 1}`}>
              <p className="text-ink-2">{pos.reasoning}</p>
            </Block>
          )}
          {pos && pos.cruxes.length > 0 && (
            <Block title="What would change its mind">
              <List items={pos.cruxes} />
            </Block>
          )}
          {agent.reversed && (
            <p className="text-ink-3">
              Reversed direction during the debate — travelled {fmt(agent.swing)} to end{" "}
              {agent.shift === 0 ? "where it started" : `${fmt(Math.abs(agent.shift))} ${agent.shift > 0 ? "higher" : "lower"}`}.
            </p>
          )}
          {verdict && agent.jury && agent.jury.comments.length > 0 && (
            <Block title="What the judges said">
              <ul className="space-y-1.5">
                {agent.jury.comments.map((c) => (
                  <li key={c.judge} className="text-ink-2">
                    <span className="text-ink">{c.judge}:</span> {c.comment}
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      )}
    </li>
  );
}

function Exchanges({ items }: { items: { from: string; to: string; type: string; text: string }[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 5);
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
        Who challenged whom · {items.length}
      </span>
      <ul className="mt-3 space-y-3">
        {shown.map((e, i) => (
          <li key={i} className="fade-up text-[13px] leading-relaxed">
            <span className="text-ink">{e.from}</span>
            <span className="text-ink-3"> → </span>
            <span className="text-ink">{e.to}</span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">{e.type}</span>
            <p className="mt-0.5 text-ink-2">{e.text}</p>
          </li>
        ))}
      </ul>
      {items.length > 5 && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 underline decoration-dotted underline-offset-4 hover:text-ink"
        >
          {all ? "show fewer" : `show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

function Conclusion({ debate }: { debate: Debate }) {
  const c = debate.conclusion!;
  return (
    <div className="fade-up rounded-lg border border-border-strong bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Verdict</span>
        <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
          {c.consensus}
        </span>
      </div>
      <p className="mt-3 font-display text-lg leading-snug text-ink">{c.verdict}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{c.reasoning}</p>
      {c.whatWouldSettleIt.length > 0 && (
        <div className="mt-4 text-[13px] leading-relaxed">
          <Block title="What would settle it">
            <List items={c.whatWouldSettleIt} />
          </Block>
        </div>
      )}
      <p className="mt-4 border-t border-border pt-3 text-[12px] leading-relaxed text-ink-3">
        {c.modelWritten
          ? "Written by a separate synthesis pass over the final positions."
          : "The synthesis pass failed on this debate; this conclusion is computed from the numbers alone."}
        {debate.judges.length > 0 && <> Craft scored by {debate.judges.join(", ")} — none of whom argued.</>}
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">{title}</span>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-ink-2">
          <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-ink-3" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
