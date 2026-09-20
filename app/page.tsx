import { DebateDemo } from "@/components/DebateDemo";
import { education, person, projects, roles, skills } from "@/lib/profile";

export default function Home() {
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
            the intro paragraph and the demo read as one continuous essay, and
            the input field arrives with nothing to explain why it is there. */}
        <section className="pt-16 sm:pt-24">
          <div className="overflow-hidden rounded-xl border border-border-strong">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-border bg-surface px-5 py-3 sm:px-7">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
                Epistemic Marketplace
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                Six cognitive architectures
              </span>
            </div>

            <div className="px-5 py-7 sm:px-7 sm:py-9">
              <p className="mb-7 max-w-2xl text-[14px] leading-relaxed text-ink-2">
                Rather than describe the multi-agent systems I build, here is
                one. Six agents with different cognitive architectures evaluate
                a claim independently — each with its own reasoning rules and
                its own declared blind spot. Where they disagree is the point.
              </p>
              <DebateDemo />
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
