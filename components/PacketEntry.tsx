"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRequest } from "@/lib/useRequest";

export type Route = { id: string; path: string; services: string[] };

type Rect = { cx: number; cy: number; l: number; r: number; t: number; b: number };
type Pt = { x: number; y: number };
type Tone = "request" | "response" | "idle";

const HOPS = [
  { id: "entry", label: "entrypoint", value: "websecure :443" },
  { id: "redirect", label: "middleware", value: "redirect-https" },
  { id: "headers", label: "middleware", value: "secure-headers" },
  { id: "compress", label: "middleware", value: "compress" },
  { id: "router", label: "router", value: "Host" },
] as const;

const IDLE_EVERY_MS = 2400;

/**
 * The landing page as a request entering an edge proxy.
 *
 * The visitor's request arrives on an entrypoint, crosses the middleware
 * chain, a router matches it and fans it out to the page's sections, and the
 * response comes back — at which point the person behind the site answers.
 * After that the system stays alive: packets keep flowing to random routes,
 * and hovering a route sends one down it.
 *
 * This is the site's routing drawn as a config, not a trace: the site is not
 * served through Traefik, so no hop here pretends to be measured. What is
 * measured is the visitor's own request — protocol, status and time to first
 * byte come from their browser, and are left out when it does not say.
 */
export function PacketEntry({
  routes,
  name,
  role,
  location,
  headline,
}: {
  routes: Route[];
  name: string;
  role: string;
  location: string;
  headline: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const nodes = useRef<Record<string, HTMLElement | null>>({});
  const [rects, setRects] = useState<Record<string, Rect> | null>(null);
  // Per node: how many packets are passing, and the tone of the latest one.
  const [lit, setLit] = useState<Record<string, { n: number; tone: Tone }>>({});
  const [answered, setAnswered] = useState(false);
  const [visible, setVisible] = useState(true);
  const request = useRequest();

  // ── Geometry: every connection and packet path is derived from where the
  //    boxes actually landed, so one layout serves desktop and phone alike.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const out: Record<string, Rect> = {};
      for (const [id, node] of Object.entries(nodes.current)) {
        if (!node) continue;
        const r = node.getBoundingClientRect();
        const l = r.left - base.left;
        const t = r.top - base.top;
        out[id] = { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
      }
      setRects(out);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Stop the idle traffic when the hero is off screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const flash = useCallback((id: string, tone: Tone, ms = 420) => {
    setLit((prev) => ({ ...prev, [id]: { n: (prev[id]?.n ?? 0) + 1, tone } }));
    setTimeout(() => {
      setLit((prev) => {
        const cur = prev[id];
        if (!cur) return prev;
        const next = { ...prev };
        if (cur.n <= 1) delete next[id];
        else next[id] = { ...cur, n: cur.n - 1 };
        return next;
      });
    }, ms);
  }, []);

  /** Sends one packet along a path, lighting each named stop as it arrives. */
  const fire = useCallback(
    (
      path: { pt: Pt; stop?: string }[],
      opts: { duration: number; tone: Tone },
    ) =>
      new Promise<void>((resolve) => {
        const host = layer.current;
        if (!host || path.length < 2) return resolve();

        const lens = [0];
        for (let i = 1; i < path.length; i++) {
          const a = path[i - 1].pt;
          const b = path[i].pt;
          lens.push(lens[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
        }
        const total = lens[lens.length - 1] || 1;

        const dot = document.createElement("span");
        dot.className = `packet packet-${opts.tone}`;
        host.appendChild(dot);

        const anim = dot.animate(
          path.map((p, i) => ({
            transform: `translate(${p.pt.x}px, ${p.pt.y}px) translate(-50%, -50%)`,
            opacity: i === 0 ? 0 : 1,
            offset: lens[i] / total,
          })),
          { duration: opts.duration, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
        );

        const timers = path.map((p, i) =>
          p.stop ? setTimeout(() => flash(p.stop!, opts.tone), (opts.duration * lens[i]) / total) : null,
        );
        anim.onfinish = anim.oncancel = () => {
          timers.forEach((t) => t && clearTimeout(t));
          dot.remove();
          resolve();
        };
      }),
    [flash],
  );

  // ── Paths through the chain, computed from the measured boxes.
  const chain = useCallback(
    (r: Record<string, Rect>) => HOPS.map((h) => ({ pt: { x: r[h.id].cx, y: r[h.id].cy }, stop: h.id })),
    [],
  );

  const fanOut = useCallback((r: Record<string, Rect>, routeId: string) => {
    const from = r.router;
    const to = r[`route-${routeId}`];
    const sideways = to.l > from.r;
    if (sideways) {
      const mid = (from.r + to.l) / 2;
      return [
        { pt: { x: from.cx, y: from.cy } },
        { pt: { x: mid, y: from.cy } },
        { pt: { x: mid, y: to.cy } },
        { pt: { x: to.l + 14, y: to.cy }, stop: `route-${routeId}` },
      ];
    }
    const mid = (from.b + to.t) / 2;
    return [
      { pt: { x: from.cx, y: from.cy } },
      { pt: { x: from.cx, y: mid } },
      { pt: { x: to.cx, y: mid } },
      { pt: { x: to.cx, y: to.t + 12 }, stop: `route-${routeId}` },
    ];
  }, []);

  const incoming = (r: Record<string, Rect>) => {
    const e = r.entry;
    const sideways = r.redirect.l > e.r;
    return sideways ? { x: e.l - 70, y: e.cy } : { x: e.cx, y: e.t - 44 };
  };

  // ── The first request, once, when the geometry is known. The ref marks a
  //    sequence in flight and is cleared if that sequence is cancelled — so a
  //    Strict Mode double-invoke, or a resize mid-intro, restarts it rather
  //    than leaving the page waiting for an answer that never comes.
  const running = useRef(false);
  useEffect(() => {
    if (!rects || answered || running.current) return;
    running.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setAnswered(true), 0);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 450));
      if (cancelled) return;
      await fire([{ pt: incoming(rects) }, ...chain(rects)], { duration: 1300, tone: "request" });
      if (cancelled) return;
      await Promise.all(routes.map((rt) => fire(fanOut(rects, rt.id), { duration: 520, tone: "request" })));
      if (cancelled) return;
      await fire([...chain(rects)].reverse(), { duration: 700, tone: "response" });
      if (!cancelled) setAnswered(true);
    })();
    return () => {
      cancelled = true;
      running.current = false;
    };
    // fire/chain/fanOut are stable; routes come from the server and do not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rects, answered]);

  // ── Idle traffic: the system keeps serving after it has answered.
  useEffect(() => {
    if (!answered || !visible || !rects) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const rt = routes[Math.floor(Math.random() * routes.length)];
      fire([{ pt: incoming(rects) }, ...chain(rects), ...fanOut(rects, rt.id).slice(1)], {
        duration: 1500,
        tone: "idle",
      });
    }, IDLE_EVERY_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, visible, rects, routes]);

  const sendTo = (id: string) => {
    if (!rects || !answered) return;
    fire([...chain(rects), ...fanOut(rects, id).slice(1)], { duration: 900, tone: "request" });
  };

  // Static wires drawn under the boxes.
  const wires: string[] = [];
  if (rects) {
    const c = chain(rects);
    wires.push(c.map((p, i) => `${i ? "L" : "M"}${p.pt.x} ${p.pt.y}`).join(" "));
    for (const rt of routes) {
      if (!rects[`route-${rt.id}`]) continue;
      wires.push(fanOut(rects, rt.id).map((p, i) => `${i ? "L" : "M"}${p.pt.x} ${p.pt.y}`).join(" "));
    }
  }

  const status = request?.status ?? null;

  return (
    <section
      className="hero-stage relative flex min-h-[100svh] flex-col justify-center pb-16 pt-20 sm:pb-20 sm:pt-28"
      data-answered={answered}
    >
      {/* The visitor's request, as their browser made it. */}
      <p className="nums mb-6 min-h-[1.25rem] font-mono text-[12px] text-ink-3 lg:mb-8">
        {request && (
          <span className="fade-up">
            <span className="text-accent">GET</span> <span className="text-ink">{request.path}</span>{" "}
            {request.protocol} · host <span className="text-ink-2">{request.host}</span>
          </span>
        )}
      </p>

      <div ref={stage} className="relative">
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {wires.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--wire)" strokeWidth={1} />
          ))}
        </svg>

        <div className="relative grid justify-items-center gap-y-2.5 lg:grid-cols-[repeat(5,auto)_minmax(0,1fr)] lg:items-center lg:justify-items-start lg:gap-x-9 lg:gap-y-4">
          {HOPS.map((h) => (
            <div
              key={h.id}
              ref={(el) => {
                nodes.current[h.id] = el;
              }}
              data-lit={lit[h.id]?.tone}
              className="hop relative z-[1] flex items-baseline gap-2.5 rounded-lg border px-3 py-1.5 font-mono lg:block lg:py-2"
            >
              <span className="text-[9px] uppercase tracking-[0.16em] text-ink-3 lg:block">{h.label}</span>
              <span className="block max-w-[240px] truncate whitespace-nowrap text-[11px] text-ink lg:mt-1 lg:text-[12px]">
                {h.id === "router" ? (
                  <>
                    Host(<span className="text-ink-2">`{request?.host ?? "…"}`</span>)
                  </>
                ) : (
                  h.value
                )}
              </span>
            </div>
          ))}

          <ul
            aria-label="Sections"
            className="mt-5 grid w-full grid-cols-2 gap-2 lg:mt-0 lg:grid-cols-1 lg:justify-self-end lg:pl-10"
          >
            {routes.map((rt) => (
              <li key={rt.id}>
                <a
                  href={`#${rt.id}`}
                  ref={(el) => {
                    nodes.current[`route-${rt.id}`] = el;
                  }}
                  onMouseEnter={() => sendTo(rt.id)}
                  onFocus={() => sendTo(rt.id)}
                  data-lit={lit[`route-${rt.id}`]?.tone}
                  className="hop group relative z-[1] block rounded-lg border px-3 py-2 font-mono"
                >
                  <span className="block text-[12px] text-ink">
                    <span className="hidden text-ink-3 lg:inline">PathPrefix(`</span>
                    {rt.path}
                    <span className="hidden text-ink-3 lg:inline">`)</span>
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-ink-3 transition-colors group-hover:text-ink-2">
                    {rt.services.join(" · ")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div ref={layer} aria-hidden className="pointer-events-none absolute inset-0 z-[2]" />
      </div>

      {/* The answer. */}
      <div className="answer mt-10 sm:mt-16">
        <p className="nums font-mono text-[12px] text-ink-3">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--ok)] align-middle" />
          {status ? `${status} ${status === 200 ? "OK" : ""}`.trim() : "response"}
          {request?.firstByteMs != null && <> · first byte in {request.firstByteMs} ms</>}
        </p>
        <h1 className="mt-5 font-display text-5xl leading-none tracking-[-0.01em] text-ink sm:text-7xl">{name}</h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">
          {role} · {location}
        </p>
        <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-ink-2 sm:text-xl">{headline}</p>
      </div>

      <a
        href={`#${routes[0]?.id ?? ""}`}
        className="answer absolute bottom-6 left-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 transition-colors hover:text-ink"
      >
        scroll ↓
      </a>
    </section>
  );
}
