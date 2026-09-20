"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AGENTS, type Archetype } from "@/lib/agents";
import { CACHED_DEBATES } from "@/lib/cached-debates";
import {
  computeBeliefDistribution,
  type AgentPosition,
  type BeliefDistribution,
  type DebateEvent,
} from "@/lib/debate";
import { AgentCard, type AgentState } from "./AgentCard";
import { BeliefDistributionChart } from "./Belief";

type Source = "cached" | "live";

const idleStates = (): Record<Archetype, AgentState> =>
  Object.fromEntries(AGENTS.map((a) => [a.archetype, { status: "idle" }])) as Record<
    Archetype,
    AgentState
  >;

const thinkingStates = (): Record<Archetype, AgentState> =>
  Object.fromEntries(
    AGENTS.map((a) => [a.archetype, { status: "thinking" }]),
  ) as Record<Archetype, AgentState>;

/** Deterministic, uneven delays — six agents never finish in tidy lockstep. */
const REVEAL_DELAYS = [420, 760, 1020, 1380, 1660, 2000];

export function DebateDemo() {
  const [claim, setClaim] = useState(CACHED_DEBATES[0].claim);
  const [note, setNote] = useState<string | null>(CACHED_DEBATES[0].note);
  const [source, setSource] = useState<Source>("cached");
  const [states, setStates] = useState<Record<Archetype, AgentState>>(idleStates);
  const [distribution, setDistribution] = useState<BeliefDistribution | null>(null);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abort = useRef<AbortController | null>(null);

  const clearPending = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    abort.current?.abort();
    abort.current = null;
  }, []);

  /** Replays a stored debate with staggered reveals. No network, no cost. */
  const playCached = useCallback(
    (index: number) => {
      clearPending();
      const debate = CACHED_DEBATES[index];

      setClaim(debate.claim);
      setNote(debate.note);
      setSource("cached");
      setNotice(null);
      setDistribution(null);
      setStates(thinkingStates());
      setRunning(true);

      const landed: AgentPosition[] = [];

      debate.positions.forEach((position, i) => {
        timers.current.push(
          setTimeout(() => {
            landed.push(position);
            setStates((prev) => ({
              ...prev,
              [position.archetype]: { status: "done", position },
            }));
          }, REVEAL_DELAYS[i] ?? 2000),
        );
      });

      timers.current.push(
        setTimeout(() => {
          setDistribution(computeBeliefDistribution(debate.positions));
          setRunning(false);
        }, (REVEAL_DELAYS.at(-1) ?? 2000) + 380),
      );
    },
    [clearPending],
  );

  /** Runs the six agents for real against the Claude API. */
  const runLive = useCallback(
    async (userClaim: string) => {
      clearPending();
      const controller = new AbortController();
      abort.current = controller;

      setClaim(userClaim);
      setNote(null);
      setSource("live");
      setNotice(null);
      setDistribution(null);
      setStates(thinkingStates());
      setRunning(true);

      try {
        const res = await fetch("/api/debate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ claim: userClaim }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const payload = await res.json().catch(() => null);
          setNotice(
            payload?.error ??
              "The live debate is unavailable right now. The cached debates below still work.",
          );
          setStates(idleStates());
          setRunning(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;

            let event: DebateEvent;
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            if (event.type === "position") {
              setStates((prev) => ({
                ...prev,
                [event.position.archetype]: { status: "done", position: event.position },
              }));
            } else if (event.type === "agent_error") {
              setStates((prev) => ({
                ...prev,
                [event.archetype]: { status: "error", message: event.message },
              }));
            } else if (event.type === "aggregate") {
              setDistribution(event.distribution);
            } else if (event.type === "error") {
              setNotice(event.message);
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          setNotice("The live debate was interrupted. The cached debates below still work.");
        }
      } finally {
        setRunning(false);
      }
    },
    [clearPending],
  );

  useEffect(() => {
    playCached(0);
    return clearPending;
  }, [playCached, clearPending]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (value.length < 8 || running) return;
    runLive(value);
  };

  return (
    <section aria-label="Live multi-agent debate" className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="claim" className="sr-only">
          A claim to put to the six agents
        </label>
        <input
          id="claim"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={240}
          placeholder="Put a contested claim to the six…"
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 focus:border-border-strong focus:outline-none"
        />
        <button
          type="submit"
          disabled={running || input.trim().length < 8}
          className="shrink-0 rounded-md border border-border-strong bg-surface-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? "running…" : "run the debate"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          or replay
        </span>
        {CACHED_DEBATES.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => playCached(i)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              claim === d.claim
                ? "border-border-strong bg-surface-2 text-ink"
                : "border-border text-ink-3 hover:text-ink"
            }`}
          >
            {d.id.replace(/-/g, " ")}
          </button>
        ))}
      </div>

      {notice && (
        <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink-2">
          {notice}
        </p>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="font-display text-xl leading-snug text-ink sm:text-2xl">
            “{claim}”
          </p>
          <span
            className="shrink-0 rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3"
            title={
              source === "cached"
                ? "A stored transcript from a previous run — replayed, not generated now."
                : "Generated just now by six parallel calls to the Claude API."
            }
          >
            {source === "cached" ? "cached run" : "live run"}
          </span>
        </div>
        {note && <p className="mt-2 text-sm text-ink-3">{note}</p>}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.archetype} agent={agent} state={states[agent.archetype]} />
        ))}
      </div>

      {distribution && (
        <div className="mt-6 fade-up">
          <BeliefDistributionChart d={distribution} />
        </div>
      )}
    </section>
  );
}
