/**
 * Deliberately small rate limiter.
 *
 * State is per-instance and in memory, so it resets on cold start and does not
 * coordinate across serverless instances. That is an accepted tradeoff for a
 * portfolio demo: the cached debates are the default path and cost nothing, so
 * this only has to blunt casual abuse of the live path, not survive an attack.
 * Swap in Upstash Redis if this ever needs to hold a real line.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const PER_IP_PER_HOUR = Number(process.env.DEBATE_PER_IP_PER_HOUR ?? 2);
const GLOBAL_PER_DAY = Number(process.env.DEBATE_GLOBAL_PER_DAY ?? 15);

const ipHits = new Map<string, number[]>();
let dayWindowStart = Date.now();
let dayCount = 0;

export type RateVerdict =
  | { ok: true; remaining: number }
  | { ok: false; reason: string; retryAfterSeconds: number };

export function checkRateLimit(ip: string): RateVerdict {
  const now = Date.now();

  if (now - dayWindowStart > DAY) {
    dayWindowStart = now;
    dayCount = 0;
  }
  if (dayCount >= GLOBAL_PER_DAY) {
    return {
      ok: false,
      reason: "The live demo has hit its daily budget. The cached debates below still work.",
      retryAfterSeconds: Math.ceil((dayWindowStart + DAY - now) / 1000),
    };
  }

  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < HOUR);
  if (hits.length >= PER_IP_PER_HOUR) {
    return {
      ok: false,
      reason: `You have used ${PER_IP_PER_HOUR} live runs this hour. Try a cached debate instead.`,
      retryAfterSeconds: Math.ceil((hits[0] + HOUR - now) / 1000),
    };
  }

  hits.push(now);
  ipHits.set(ip, hits);
  dayCount += 1;

  // Keep the map from growing without bound on a long-lived instance.
  if (ipHits.size > 5000) {
    for (const [key, times] of ipHits) {
      if (times.every((t) => now - t >= HOUR)) ipHits.delete(key);
    }
  }

  return { ok: true, remaining: PER_IP_PER_HOUR - hits.length };
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
