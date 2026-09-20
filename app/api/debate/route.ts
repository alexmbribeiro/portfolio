import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { AGENTS, USER_PROMPT, type Agent } from "@/lib/agents";
import {
  computeBeliefDistribution,
  type AgentPosition,
  type DebateEvent,
} from "@/lib/debate";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Six agents run per live debate, so the model is the whole cost story.
 * There is no free tier on the Anthropic API; Haiku 4.5 is the cheap end and
 * is the default here, with Opus 5 a one-variable change for better reasoning.
 */
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const EFFORT = (process.env.ANTHROPIC_EFFORT ?? "medium") as
  | "low" | "medium" | "high" | "xhigh" | "max";

/**
 * Thinking and effort are configured differently across model generations:
 * the 4.6-and-later family takes adaptive thinking plus output_config.effort,
 * while Haiku 4.5 and its contemporaries reject effort outright and need an
 * explicit thinking budget. Sending the wrong shape is a 400, not a downgrade.
 */
function reasoningConfig(model: string) {
  const takesAdaptiveThinking = !/(-4-5$|-4-5-|-3-)/.test(model);

  if (takesAdaptiveThinking) {
    return {
      thinking: { type: "adaptive" as const },
      output_config: { effort: EFFORT, format: zodOutputFormat(PositionSchema) },
    };
  }
  return {
    thinking: { type: "enabled" as const, budget_tokens: 2000 },
    output_config: { format: zodOutputFormat(PositionSchema) },
  };
}
const MAX_CLAIM_LENGTH = 240;

const PositionSchema = z.object({
  belief_score: z.number().describe("Probability the claim is true, 0.0 to 1.0"),
  confidence_low: z.number().describe("Lower bound of the confidence interval"),
  confidence_high: z.number().describe("Upper bound of the confidence interval"),
  reasoning: z.string().describe("Full reasoning chain, 2-4 sentences"),
  key_evidence: z.array(z.string()).describe("Key evidence points"),
  cruxes: z.array(z.string()).describe("What would change your mind"),
  argument_type: z.enum(["supports", "contradicts", "qualifies", "redefines", "uncertain"]),
  argument_content: z.string().describe("Core argument in one sentence"),
  argument_strength: z.number().describe("Strength of this argument, 0.0 to 1.0"),
  unanswered_questions: z.array(z.string()).describe("Questions you cannot answer"),
});

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

async function runAgent(
  client: Anthropic,
  agent: Agent,
  claim: string,
): Promise<AgentPosition> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: agent.systemPrompt,
    ...reasoningConfig(MODEL),
    messages: [{ role: "user", content: USER_PROMPT(claim) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`${agent.name} declined to evaluate this claim.`);
  }
  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error(`${agent.name} returned no structured position.`);
  }

  return {
    ...parsed,
    belief_score: clamp01(parsed.belief_score),
    confidence_low: clamp01(parsed.confidence_low),
    confidence_high: clamp01(parsed.confidence_high),
    argument_strength: clamp01(parsed.argument_strength),
    archetype: agent.archetype,
    agent_name: agent.name,
  };
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The live debate is not configured on this deployment. Cached debates still work." },
      { status: 503 },
    );
  }

  let claim: unknown;
  try {
    claim = (await req.json())?.claim;
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (typeof claim !== "string" || claim.trim().length < 8) {
    return Response.json({ error: "Write a claim of at least 8 characters." }, { status: 400 });
  }
  if (claim.length > MAX_CLAIM_LENGTH) {
    return Response.json(
      { error: `Keep the claim under ${MAX_CLAIM_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const verdict = checkRateLimit(clientIp(req.headers));
  if (!verdict.ok) {
    return Response.json(
      { error: verdict.reason },
      { status: 429, headers: { "retry-after": String(verdict.retryAfterSeconds) } },
    );
  }

  const trimmed = claim.trim();
  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: DebateEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      send({
        type: "start",
        claim: trimmed,
        agents: AGENTS.map((a) => ({ archetype: a.archetype, name: a.name })),
      });

      // All six reason independently and in parallel — each one is streamed to
      // the client the moment it lands, so the page fills in as they finish
      // rather than waiting on the slowest agent.
      const settled = await Promise.allSettled(
        AGENTS.map(async (agent) => {
          const position = await runAgent(client, agent, trimmed);
          send({ type: "position", position });
          return position;
        }),
      );

      const positions: AgentPosition[] = [];
      settled.forEach((result, i) => {
        if (result.status === "fulfilled") {
          positions.push(result.value);
        } else {
          send({
            type: "agent_error",
            archetype: AGENTS[i].archetype,
            message: result.reason instanceof Error ? result.reason.message : "Agent failed.",
          });
        }
      });

      if (positions.length === 0) {
        send({ type: "error", message: "Every agent failed to respond. Try again shortly." });
      } else {
        send({ type: "aggregate", distribution: computeBeliefDistribution(positions) });
      }

      send({ type: "done" });
      closed = true;
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
