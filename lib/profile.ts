/**
 * Single source of truth for everything the site says about Alexandre.
 * Every claim rendered on the page comes from here — nothing is hardcoded in JSX.
 */

export const person = {
  name: "Alexandre Ribeiro",
  role: "Backend & AI Infrastructure Engineer",
  location: "Porto, Portugal",
  email: "alexandrembribeiro@gmail.com",
  github: "https://github.com/alexmbribeiro",
  githubHandle: "alexmbribeiro",
  linkedin: "https://www.linkedin.com/in/alexandrembribeiro",
  linkedinHandle: "alexandrembribeiro",
  cv: "/alexandre-ribeiro-cv.pdf",
  headline: "I build systems where several models disagree — and the disagreement is the feature.",
  intro:
    "Backend and platform engineer at a nanotechnology R&D centre. I own a lot of surface area: TypeScript microservices on AWS, Traefik at the edge, RabbitMQ and a transactional outbox for events, Redis for cache, MQTT and CoAP down to the devices, auth and RBAC on top — and the internal GPU cluster that serves a self-hosted LLM to two teams.",
} as const;

export type Role = {
  company: string;
  companyNote: string;
  title: string;
  period: string;
  location: string;
  lede: string;
  highlights: { label: string; detail: string }[];
  stack: string[];
};

export const roles: Role[] = [
  {
    company: "CeNTI",
    companyNote: "R&D centre for nanotechnology and smart materials",
    title: "Researcher — Backend & Platform",
    period: "Jan 2026 — Present",
    location: "Vila Nova de Famalicão",
    lede:
      "The job is breadth. On any given week I am somewhere between an IoT device speaking CoAP and a GPU scheduler running out of VRAM — and the same person owns both ends.",
    highlights: [
      {
        label: "Microservices & event backbone",
        detail:
          "Backend microservices in Node.js and TypeScript for IoT systems, deployed on AWS. Traefik as the reverse proxy at the edge, Redis as the cache layer.",
      },
      {
        label: "Events, without the dual write",
        detail:
          "Services talk over RabbitMQ, and events are published through a transactional outbox: the state change and the event it implies are written in the same database transaction, then relayed to the broker separately. A service can no longer commit a change and fail to announce it, or announce something it never committed — which is the failure mode that makes event-driven systems quietly inconsistent months after anyone touched them.",
      },
      {
        label: "Identity & access",
        detail:
          "Microsoft SSO for organisational accounts, plus an independent sign-up and login path for everyone else. Role-based access control with scoped permissions on top of both.",
      },
      {
        label: "Device communication",
        detail:
          "MQTT and CoAP integration for talking to constrained hardware — the protocols change, the ingestion contract does not.",
      },
      {
        label: "Self-hosted LLM cluster",
        detail:
          "Deployed and operated a self-hosted LLM on an internal GPU cluster serving 24 users across two teams. I own the full infrastructure stack and the capacity constraints that come with finite VRAM.",
      },
      {
        label: "AI code review, in production",
        detail:
          "An agent running on that local LLM, wired into GitHub Actions: it analyses pull requests, posts review comments inline, and notifies developers through Microsoft Teams adaptive cards.",
      },
      {
        label: "Multi-agent orchestration",
        detail:
          "Workflows that fan work out across agents and execute in parallel instead of serially — the productivity win came from concurrency, not from a better prompt.",
      },
      {
        label: "Operations",
        detail:
          "Observability with Prometheus and Grafana for real-time metrics. Secrets managed with Doppler across every environment. Everything containerised with Docker.",
      },
    ],
    stack: [
      "TypeScript", "Node.js", "AWS", "Traefik", "RabbitMQ", "Transactional outbox", "Redis",
      "MQTT", "CoAP", "Docker", "Prometheus", "Grafana", "Doppler", "OAuth / RBAC",
    ],
  },
  {
    company: "Fashable AI",
    companyNote: "Fashion trend intelligence",
    title: "Software Engineering Intern",
    period: "Feb 2025 — Jun 2025",
    location: "Remote",
    lede:
      "Built an AI agent that collects, processes and analyses visual fashion trends on Instagram, aimed at digital behaviour and style forecasting.",
    highlights: [
      {
        label: "Architecture as a first-class concern",
        detail:
          "TypeScript throughout, following SOLID and Onion Architecture, with the C4 model for documentation and system design — so the boundaries were drawn before the code, not after.",
      },
      {
        label: "Monorepo",
        detail:
          "Structured the system as a monorepo to keep separation of concerns clean while letting the pipeline stages share types and tooling.",
      },
    ],
    stack: ["TypeScript", "SOLID", "Onion Architecture", "C4 model", "Monorepo"],
  },
];

export type Project = {
  name: string;
  tagline: string;
  year: string;
  body: string;
  detail: string;
  stack: string[];
  flag?: string;
  /** Engineering notes: what broke, and how it was found. */
  notes?: string[];
};

export const projects: Project[] = [
  {
    name: "Epistemic Marketplace",
    tagline: "Fourteen philosophers who disagree on purpose",
    year: "2025 — 2026",
    flag: "Replayed at the top of this page",
    body:
      "Most AI products collapse a hard question into one confident answer. This one refuses to. Fourteen agents, each a philosopher's method written as a prompt — Hume, Nagarjuna, Weil, Kant, Dostoevsky and nine more — argue a claim over three rounds: alone, then cross-examining each other by name, then revising. Each declares what a belief score means in its own vocabulary and where its method is systematically wrong. The output is where they landed and who moved, not a verdict.",
    detail:
      "After every debate, three philosophers who took no part score each participant on craft — did it hold to its own method, engage what was actually said, offer cruxes that could genuinely fail — and never on whether they agreed with it. Those scores move a peer Elo, and each judge's severity is published beside it. Nothing in the ranking measures being right: there is no ground truth for these claims, and appointing one would mean appointing someone to declare it.",
    notes: [
      "Runs on the Gemini Live API, because the regular endpoint's free tier allows about twenty requests a day and one debate is eighteen calls. Structured output meant declaring a function and requesting audio that is never read — the tool-call channel is independent of the audio stream.",
      "Gemini treats a schema as a hint, not a contract: cruxes came back as objects, argument types outside the enum. Every response is coerced against the declared schema before it reaches the database, and a missing required field triggers a re-ask — never a fabricated value.",
      "Quota errors arrive two ways: an HTTP 429, or a websocket close frame with code 1011 and no status code at all. Retrying only the first silently killed whole juries. Both are classified now, and a bounded semaphore stops six agents backing off in lockstep and colliding again.",
      "Challenge edges were matched by substring, so every adjectival form missed — \"Wittgensteinian\" does not fit inside \"Wittgenstein\". 95 of 234 edges were being drawn. Worse, the ones that were drawn never reached the agent they targeted: round three saw only headlines. The graph depicted a confrontation that had not happened.",
      "Reputation weighting was removed. It was seeded at 1.0 and nothing ever moved it, so every weighted mean equalled the plain mean — a sophistication that was only decorative.",
    ],
    stack: [
      "Python", "FastAPI", "PostgreSQL", "Redis", "WebSockets",
      "Gemini Live API", "Next.js", "TypeScript",
    ],
  },
  {
    name: "AI Code Review Agent",
    tagline: "A local LLM reviewing every pull request",
    year: "2026",
    flag: "Shipped at CeNTI",
    body:
      "An agent that reads pull requests and reviews them, running entirely on the LLM cluster I deployed in-house — no code leaves the building. It is wired into GitHub Actions, posts its comments inline on the diff, and pushes a summary to the right developer through Microsoft Teams adaptive cards.",
    detail:
      "The interesting constraint was not the model. It was operating within a fixed GPU budget shared with 24 other users while keeping review latency low enough that people would actually read the comments before merging.",
    stack: ["Self-hosted LLM", "GitHub Actions", "TypeScript", "Microsoft Teams", "Docker"],
  },
  {
    name: "Personal Hub",
    tagline: "An iOS app that never phones home",
    year: "2025",
    body:
      "Finances, sleep, habits and journalling in one iOS app. No account, no server, no sync — every byte lives in a local SQLite database on the device.",
    detail:
      "Transactions by category, monthly recurring entries that need confirmation rather than firing silently, budgets that warn before they break, and savings goals. Local-first is a position, not a limitation: the data is worth more to me than the analytics would be to anyone else.",
    stack: ["iOS", "SQLite", "Local-first"],
  },
];

export const education = {
  school: "Instituto Superior de Engenharia do Porto",
  degree: "BSc, Software Engineering",
  period: "Sep 2022 — Jun 2025",
  location: "Porto, Portugal",
};

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["TypeScript", "Python", "Java", "C#"] },
  { group: "Backend", items: ["Node.js", "Express", "FastAPI", "REST", "PostgreSQL", "Redis", "RabbitMQ", "Transactional outbox"] },
  { group: "Infrastructure", items: ["AWS", "Docker", "Traefik", "Prometheus", "Grafana", "Doppler", "Git"] },
  { group: "IoT", items: ["MQTT", "CoAP"] },
  { group: "AI / LLM", items: ["LLM deployment", "Multi-agent orchestration", "Claude API", "GPU cluster ops"] },
];
