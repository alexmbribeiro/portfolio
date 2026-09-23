import { readFileSync } from "node:fs";
import { join } from "node:path";

import { EpistemicDemo } from "@/components/EpistemicDemo";
import { PacketEntry, type Route } from "@/components/PacketEntry";
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

  const routes: Route[] = [
    { id: "work", path: "/work", services: roles.map((r) => r.company) },
    { id: "projects", path: "/projects", services: projects.map((p) => p.name) },
    { id: "toolkit", path: "/toolkit", services: skills.map((g) => g.group) },
    { id: "contact", path: "/contact", services: ["email", "GitHub", "LinkedIn", "CV"] },
  ];

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-baseline justify-end gap-6 px-5 pt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3 sm:px-8">
          <a href={person.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
            GitHub
          </a>
          <a href={person.cv} className="transition-colors hover:text-ink">
            CV (pdf)
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        {/* The visitor's request enters, crosses the chain, is routed to the
            sections below, and the response is the person behind the site. */}
        <PacketEntry
          routes={routes}
          name={person.name}
          role={person.role}
          location={person.location}
          headline={person.headline}
        />

        {/* ── Work ─────────────────────────────────────────────────────── */}
        <section id="work" className="scroll-mt-16 pt-4 sm:pt-8">
          <div className="rule mb-10" />
          <div>
              <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-ink-3"><span className="text-accent">GET</span> /work</p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Work</h2>
            </div>

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
          <div>
              <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-ink-3"><span className="text-accent">GET</span> /projects</p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Projects</h2>
            </div>

          <div className="mt-12 space-y-14">
            {projects.map((p) => (
              <div key={p.name}>
                <article className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
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
                {p.name === "Epistemic Marketplace" && (
                  <div className="mt-10">
                    <EpistemicDemo snapshot={snapshot} groups={groups} initial={initial} gap={gap} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills & education ───────────────────────────────────────── */}
        <section id="toolkit" className="scroll-mt-16 pt-20 sm:pt-28">
          <div className="rule mb-10" />
          <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-ink-3"><span className="text-accent">GET</span> /toolkit</p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Toolkit</h2>
            </div>
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
            <div>
              <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-ink-3"><span className="text-accent">GET</span> /contact</p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Contact</h2>
            </div>
            <div>
              <p className="max-w-xl font-display text-2xl leading-snug text-ink sm:text-3xl">
                If the hard part of what you are building is everything between
                the request and the response, I would like to hear about it.
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
          <a
            href="https://github.com/alexmbribeiro/portfolio"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink"
          >
            Source on GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
