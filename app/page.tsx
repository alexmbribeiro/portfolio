import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DebateReplay } from "@/components/DebateReplay";
import { Ranking } from "@/components/Ranking";
import {
  claimGroups,
  featuredDebate,
  runToRunGap,
  snapshot,
  type Debate,
} from "@/lib/marketplace";
import { education, person, projects, roles, skills } from "@/lib/profile";

// The page opens on one debate already rendered; the rest are static files the
// replay fetches when a visitor picks them.
function loadDebate(id: string): Debate {
  return JSON.parse(readFileSync(join(process.cwd(), "public", "debates", `${id}.json`), "utf8"));
}

export default function Home() {
  const groups = claimGroups(snapshot.debates);
  const initial = loadDebate(featuredDebate(snapshot.debates).id);
  const gap = runToRunGap(groups);

  return (
    <>
      <header className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-5 pt-8 sm:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2">
          {person.name}
        </span>
        <nav className="flex gap-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
          <a href="#work" className="transition-colors hover:text-ink">Work</a>
          <a href="#projects" className="transition-colors hover:text-ink">Projects</a>
          <a href="#contact" className="transition-colors hover:text-ink">Contact</a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="pt-16 sm:pt-24">
          <h1 className="max-w-4xl font-display text-[2.6rem] leading-[1.08] tracking-[-0.01em] text-ink sm:text-6xl">
            {person.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-2 sm:text-base">
            {person.intro}
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
            {person.role} · {person.location}
          </p>
        </section>

        {/* ── The demo ─────────────────────────────────────────────────── */}
        {/* Framed as a device rather than more prose: without a hard boundary
            the intro paragraph and the demo read as one continuous essay. */}
        <section className="pt-16 sm:pt-24">
          <div className="overflow-hidden rounded-xl border border-border-strong">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-border bg-surface px-5 py-3 sm:px-7">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
                Epistemic Marketplace
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                Recorded debates · replayed
              </span>
            </div>

            <div className="px-5 py-7 sm:px-7 sm:py-9">
              <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <p className="max-w-2xl text-[14px] leading-relaxed text-ink-2">
                  Rather than describe the multi-agent systems I build, here is
                  one. Fourteen agents, each a philosopher&rsquo;s method written
                  as a prompt, argue a claim over three rounds. These are debates
                  the system actually ran — copied from it, not written for this
                  page. Pick a claim, or watch the one where minds moved furthest.
                </p>
                {gap && (
                  <p className="text-[13px] leading-relaxed text-ink-3 lg:border-l lg:border-border lg:pl-5">
                    Every claim here was argued twice, and the runs do not agree.
                    &ldquo;{gap.claim}&rdquo; landed at{" "}
                    <span className="nums text-ink">{gap.a.toFixed(2)}</span> once
                    and <span className="nums text-ink">{gap.b.toFixed(2)}</span>{" "}
                    the next. That variance is part of the result.
                  </p>
                )}
              </div>

              <DebateReplay groups={groups} initial={initial} />

              <div className="mt-14 border-t border-border pt-8">
                <div className="mb-6 max-w-2xl">
                  <h3 className="font-display text-2xl text-ink">Who argued best</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                    After each debate, three philosophers who took no part score
                    every debater on craft — did it hold to its own method, engage
                    what was actually said, offer cruxes that could really fail,
                    move only when given a reason — and never on whether they
                    agreed. Those scores become pairwise results inside the debate
                    and move an Elo from 1500. Nothing here measures being right.
                  </p>
                </div>
                <Ranking snapshot={snapshot} />
              </div>

              <p className="mt-8 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-3">
                Synced {snapshot.syncedAt.slice(0, 10)}
                {snapshot.sourceCommit && <> from commit {snapshot.sourceCommit}</>} ·{" "}
                <a
                  href="https://github.com/alexmbribeiro/epistemic-marketplace"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink"
                >
                  source on GitHub
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ── Work ─────────────────────────────────────────────────────── */}
        <section id="work" className="scroll-mt-16 pt-20 sm:pt-28">
          <div className="rule mb-10" />
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Work</h2>

          <div className="mt-12 space-y-16">
            {roles.map((role) => (
              <article key={role.company} className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="font-display text-2xl leading-none text-ink">
                    {role.company}
                  </h3>
                  <p className="mt-2 text-[13px] leading-snug text-ink-3">
                    {role.companyNote}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-3">
                    {role.title}
                    <br />
                    {role.period}
                    <br />
                    {role.location}
                  </p>
                </div>

                <div>
                  <p className="max-w-2xl text-[15px] leading-relaxed text-ink">
                    {role.lede}
                  </p>

                  <dl className="mt-7 space-y-5">
                    {role.highlights.map((h) => (
                      <div key={h.label} className="grid gap-1 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-5">
                        <dt className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-3">
                          {h.label}
                        </dt>
                        <dd className="text-[14px] leading-relaxed text-ink-2">
                          {h.detail}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-7 flex flex-wrap gap-1.5">
                    {role.stack.map((s) => (
                      <li
                        key={s}
                        className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-ink-3"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Projects ─────────────────────────────────────────────────── */}
        <section id="projects" className="scroll-mt-16 pt-20 sm:pt-28">
          <div className="rule mb-10" />
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Projects</h2>

          <div className="mt-12 space-y-14">
            {projects.map((p) => (
              <article key={p.name} className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="font-display text-2xl leading-tight text-ink">{p.name}</h3>
                  <p className="mt-2 text-[13px] leading-snug text-ink-3">{p.tagline}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {p.year}
                  </p>
                  {p.flag && (
                    <p className="mt-3 inline-block rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-ink-3">
                      {p.flag}
                    </p>
                  )}
                </div>

                <div className="max-w-2xl">
                  <p className="text-[15px] leading-relaxed text-ink">{p.body}</p>
                  <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{p.detail}</p>
                  {p.notes && (
                    <div className="mt-6">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                        What broke, and how it was found
                      </span>
                      <ul className="mt-3 space-y-3">
                        {p.notes.map((n) => (
                          <li key={n} className="flex gap-3 text-[13px] leading-relaxed text-ink-2">
                            <span className="mt-[9px] h-px w-3 shrink-0 bg-border-strong" />
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <li
                        key={s}
                        className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-ink-3"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Skills & education ───────────────────────────────────────── */}
        <section className="pt-20 sm:pt-28">
          <div className="rule mb-10" />
          <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">Toolkit</h2>
            <div>
              <dl className="space-y-5">
                {skills.map((group) => (
                  <div key={group.group} className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                      {group.group}
                    </dt>
                    <dd className="text-[14px] leading-relaxed text-ink-2">
                      {group.items.join(" · ")}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 border-t border-border pt-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                  Education
                </span>
                <p className="mt-2 text-[15px] text-ink">{education.school}</p>
                <p className="mt-1 text-[14px] text-ink-2">
                  {education.degree} · {education.period}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <section id="contact" className="scroll-mt-16 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="rule mb-10" />
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">Contact</h2>
            <div>
              <p className="max-w-xl font-display text-2xl leading-snug text-ink sm:text-3xl">
                If you are building something where the hard part is the
                infrastructure underneath the model, I would like to hear about
                it.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[12px] text-ink-2">
                <li>
                  <a className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink" href={`mailto:${person.email}`}>
                    {person.email}
                  </a>
                </li>
                <li>
                  <a className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink" href={person.linkedin} target="_blank" rel="noreferrer">
                    linkedin/{person.linkedinHandle}
                  </a>
                </li>
                <li>
                  <a className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink" href={person.github} target="_blank" rel="noreferrer">
                    github/{person.githubHandle}
                  </a>
                </li>
                <li>
                  <a className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink" href={person.cv}>
                    curriculum vitae (pdf)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 sm:px-8">
          <span>{person.name} · {person.location}</span>
          <span>Six agents, one page, no consensus</span>
        </div>
      </footer>
    </>
  );
}
