# alexandre ribeiro — portfolio

An editorial portfolio whose centrepiece is not a description of the work but
the work itself: a running instance of **Epistemic Marketplace**, where six
agents with different cognitive architectures evaluate a claim and produce a
distribution of belief instead of an answer.

## How the demo works

Two paths, and the page always says which one you are looking at.

| | Cached run | Live run |
|---|---|---|
| Trigger | the three preset claims | free text in the input |
| Source | stored transcripts in `lib/cached-debates.ts` | six parallel calls to the Claude API |
| Cost | none | six Opus calls |
| Works without an API key | yes | no |

The cached path is the default, so the site is fully functional on a deployment
with no credentials. The badge next to the claim reads `cached run` or
`live run` — a stored transcript is never presented as freshly generated.

## Architecture

```
lib/profile.ts          every factual claim the page makes, in one place
lib/agents.ts           the six archetypes, ported from the Python originals
lib/debate.ts           position types + the LMSR-inspired aggregator
lib/cached-debates.ts   stored transcripts
lib/ratelimit.ts        in-memory per-IP and global caps for the live path
app/api/debate/route.ts SSE endpoint: fans out to six agents, streams each
components/Belief.tsx   diverging belief meter + distribution histogram
components/DebateDemo.tsx  the interactive hero
```

Nothing in the JSX hardcodes a fact about Alexandre — `lib/profile.ts` is the
single source of truth, so the CV and the site cannot drift apart.

### The API route

`POST /api/debate` takes `{ claim }` and returns a `text/event-stream`. All six
agents are dispatched concurrently with `Promise.allSettled`, and each position
is pushed to the client the moment it lands rather than waiting on the slowest
agent. One agent failing does not fail the debate — the card shows as
unavailable and the aggregate is computed from whoever answered.

Structured output is enforced with `messages.parse()` and a Zod schema, so a
malformed position is impossible rather than merely unlikely.

### Colour

Colour does exactly one job on this site: encoding belief. Everything else is
monochrome ink. The scale is diverging — red at 0 (false), neutral grey at 0.5
(no signal), blue at 1 (true) — and both poles are validated for colour-vision
separation and 3:1 contrast against the dark surface. Every meter prints its
number, so belief is never communicated by colour alone.

## Running it

```bash
npm install
cp .env.example .env.local   # optional — only the live path needs a key
npm run dev
```

## Cost

There is no free tier on the Anthropic API. One live debate is six calls, so
the model is the whole cost story:

| Model | Relative cost | Notes |
|---|---|---|
| `claude-haiku-4-5` (default) | 1x | a few cents per debate |
| `claude-opus-5` | ~5x | noticeably sharper reasoning |

Those are estimates derived from published token pricing, not measured against
this app. Run a handful of debates and read the real figure off the Anthropic
usage dashboard before relying on it.

The spend ceiling is enforced as request caps (`DEBATE_PER_IP_PER_HOUR`,
`DEBATE_GLOBAL_PER_DAY`). Because the cached path is the default and is never
rate limited, tightening them degrades the live extra and never the site — and
deploying with no key at all is a perfectly good configuration.

Note that thinking and effort are configured differently across model
generations: Haiku 4.5 rejects `output_config.effort` and needs an explicit
thinking budget, while Opus 5 takes adaptive thinking plus effort.
`reasoningConfig()` in the route branches on this, so switching models is a
one-variable change.

## Deploying

Vercel, with `ANTHROPIC_API_KEY` set in the project's environment variables. The
rate limiter holds state in memory per instance, which is enough to blunt casual
abuse of the live path; swap in Upstash Redis if it ever needs to hold a real
line.
