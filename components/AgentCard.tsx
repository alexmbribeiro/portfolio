"use client";

import { useState } from "react";
import type { Agent } from "@/lib/agents";
import type { AgentPosition } from "@/lib/debate";
import { BeliefMeter } from "./Belief";

export type AgentState =
  | { status: "idle" }
  | { status: "thinking" }
  | { status: "done"; position: AgentPosition }
  | { status: "error"; message: string };

const ARGUMENT_LABEL: Record<AgentPosition["argument_type"], string> = {
  supports: "supports",
  contradicts: "contradicts",
  qualifies: "qualifies",
  redefines: "redefines",
  uncertain: "uncertain",
};

export function AgentCard({ agent, state }: { agent: Agent; state: AgentState }) {
  const [open, setOpen] = useState(false);
  const done = state.status === "done";

  return (
    <article
      className={`rounded-lg border bg-surface p-4 transition-colors sm:p-5 ${
        done ? "border-border-strong fade-up" : "border-border"
      }`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-lg leading-none text-ink">{agent.name}</h4>
        {done && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
            {ARGUMENT_LABEL[state.position.argument_type]}
          </span>
        )}
      </header>

      <p className="mt-2 text-[13px] leading-relaxed text-ink-3">{agent.description}</p>

      <div className="mt-4">
        {state.status === "thinking" && (
          <div className="flex items-center gap-2 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-3" />
            <span className="font-mono text-[11px] text-ink-3">reasoning…</span>
          </div>
        )}

        {state.status === "idle" && (
          <div className="h-2 w-full rounded-full bg-surface-2" aria-hidden />
        )}

        {state.status === "error" && (
          <p className="font-mono text-[11px] text-ink-3">
            unavailable — {state.message}
          </p>
        )}

        {done && (
          <>
            <BeliefMeter
              value={state.position.belief_score}
              low={state.position.confidence_low}
              high={state.position.confidence_high}
            />

            <p className="mt-4 text-sm leading-relaxed text-ink">
              {state.position.argument_content}
            </p>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 underline decoration-dotted underline-offset-4 transition-colors hover:text-ink"
              aria-expanded={open}
            >
              {open ? "hide reasoning" : "reasoning, evidence, cruxes"}
            </button>

            {open && (
              <div className="mt-4 space-y-4 border-t border-border pt-4 text-[13px] leading-relaxed">
                <Block title="Reasoning">
                  <p className="text-ink-2">{state.position.reasoning}</p>
                </Block>

                {state.position.key_evidence.length > 0 && (
                  <Block title="Key evidence">
                    <List items={state.position.key_evidence} />
                  </Block>
                )}

                {state.position.cruxes.length > 0 && (
                  <Block title="What would change its mind">
                    <List items={state.position.cruxes} />
                  </Block>
                )}

                {state.position.unanswered_questions.length > 0 && (
                  <Block title="What it cannot answer">
                    <List items={state.position.unanswered_questions} />
                  </Block>
                )}

                <Block title="Declared weakness">
                  <p className="text-ink-3">{agent.weakness}</p>
                </Block>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
        {title}
      </span>
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
