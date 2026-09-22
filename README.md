# alexandre ribeiro — portfolio

An editorial portfolio whose centrepiece is not a description of the work but
the work itself: recorded debates from
[Epistemic Marketplace](https://github.com/alexmbribeiro/epistemic-marketplace),
replayed round by round, with the peer-Elo ranking the system computes.

## Updating it

The debates on the page are copied from the running system, never written by
hand. To refresh them:

```bash
# 1. with the Epistemic Marketplace backend running on :8000
npm run sync

# 2. publish
git add data public/debates && git commit -m "Sync debates" && git push
```

`npm run sync` only ever sends GET requests, so it cannot create a debate or
change the data it copies. It writes:

| Path | What | Loaded |
|---|---|---|
| `data/marketplace.json` | index of debates, ranking, judge severity, fault lines | imported by the page at build time |
| `public/debates/<id>.json` | one full debate each: three rounds, exchanges, verdict, jury | fetched when a visitor opens it |

Debates that no longer exist upstream are removed from `public/debates/` on the
next sync. The page footer records the sync date and the Epistemic Marketplace
commit it came from.

Options: `EM_API` points at a backend other than `http://127.0.0.1:8000`;
`EM_REPO` points at the Epistemic Marketplace checkout if it is not a sibling
directory (used only to record the source commit).

## What the snapshot deliberately leaves out

- **Confidence intervals.** In about a third of stored positions the model's
  interval does not contain its own belief score, so drawing them would present
  noise as uncertainty.
- **Anything not produced by a completed debate.** Running or failed debates are
  skipped.

## Architecture

```
lib/profile.ts            every factual claim the page makes about Alexandre
lib/marketplace.ts        snapshot types, claim grouping, featured-debate choice
scripts/sync.mjs          read-only export from the Epistemic Marketplace API
components/DebateReplay   the replay: rounds, belief tracks, exchanges, verdict
components/Ranking        peer-Elo table, judge severity, fault lines
components/Belief         diverging belief colour, meter and per-round track
```

The page is fully static. There are no API routes, no environment variables
and no keys.

The replay opens on the debate where the agents moved furthest (largest total
belief swing), autoplays once through the three rounds and stops on the
verdict. With reduced motion it opens directly on the verdict.

### Colour

Colour does one job: encoding belief. Red at 0 (false), neutral grey at 0.5
(no signal), blue at 1 (true), mixed in OKLab. Both poles are validated for
colour-vision separation and 3:1 contrast against the dark surface, and every
belief is also printed as a number. Agents are identified by name, never by
colour.

## Running it

```bash
npm install
npm run dev
```

## Deploying

Vercel, with no configuration. Every push to `main` redeploys.
