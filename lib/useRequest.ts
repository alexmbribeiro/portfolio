"use client";

import { useSyncExternalStore } from "react";

export type RequestInfo = {
  host: string;
  path: string;
  /** "HTTP/2", "HTTP/3", "HTTP/1.1" — as the browser actually negotiated it. */
  protocol: string;
  /** Status of the document response, when the browser exposes it. */
  status: number | null;
  firstByteMs: number | null;
};

const noop = () => () => {};

const PROTOCOLS: Record<string, string> = { h2: "HTTP/2", h3: "HTTP/3", "http/1.1": "HTTP/1.1" };

/**
 * The visitor's real navigation for this page load, read from Navigation
 * Timing. Nothing here is invented: when the browser does not expose a value
 * it comes back null and the UI leaves it out.
 *
 * Serialised to a string so the snapshot is referentially stable across
 * renders, which useSyncExternalStore requires.
 */
export function useRequest(): RequestInfo | null {
  const raw = useSyncExternalStore(
    noop,
    () => {
      const nav = performance.getEntriesByType("navigation")[0] as
        | (PerformanceNavigationTiming & { responseStatus?: number })
        | undefined;
      const proto = nav?.nextHopProtocol ?? "";
      return JSON.stringify({
        host: location.host,
        path: location.pathname,
        protocol: PROTOCOLS[proto] ?? (proto ? proto.toUpperCase() : "HTTP"),
        status: nav?.responseStatus && nav.responseStatus > 0 ? nav.responseStatus : null,
        firstByteMs:
          nav && nav.responseStart > 0 ? Math.round(nav.responseStart - nav.startTime) : null,
      } satisfies RequestInfo);
    },
    () => "",
  );
  return raw ? (JSON.parse(raw) as RequestInfo) : null;
}
