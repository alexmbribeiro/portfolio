import type { AgentPosition } from "./debate";

/**
 * Pre-computed debates.
 *
 * These are the default path: they cost nothing, never fail, and let the demo
 * work on a deployment with no API key. They are labelled as cached in the UI —
 * the point of this project is calibrated honesty, so passing a stored
 * transcript off as a live run would undercut the whole argument.
 */
export type CachedDebate = {
  id: string;
  claim: string;
  note: string;
  positions: AgentPosition[];
};

export const CACHED_DEBATES: CachedDebate[] = [
  {
    id: "remote-work",
    claim: "Remote work makes engineering teams more productive.",
    note: "A claim where the six split almost evenly — the disagreement is the finding.",
    positions: [
      {
        archetype: "bayesian",
        agent_name: "Bayesian",
        belief_score: 0.55,
        confidence_low: 0.38,
        confidence_high: 0.71,
        reasoning:
          "My reference class is 'workplace interventions claimed to raise knowledge-worker output', where the base rate of durable positive effects is low — roughly 0.3, because most such interventions wash out. Remote work is unusual in that it changes two variables at once: it removes commute and interruption cost (likelihood ratio favouring the claim) while degrading the high-bandwidth channel that unblocks junior engineers (ratio against). The strongest evidence, Bloom's randomised Ctrip trial, gives a positive posterior but on call-centre work, which transfers poorly. I land just above even.",
        key_evidence: [
          "Bloom et al. randomised trial: 13% performance increase, but in call-centre work, not engineering",
          "Repeated developer surveys report higher self-assessed focus time when remote",
          "Onboarding and mentorship metrics degrade most consistently in remote cohorts",
        ],
        cruxes: [
          "A randomised trial on engineering teams specifically, not self-selected knowledge workers, would move me 0.15 in either direction",
          "Evidence separating tenured engineers from first-year hires — I suspect the effect sign flips between them",
        ],
        argument_type: "qualifies",
        argument_content:
          "The evidence supports a modest positive effect for tenured engineers and a negative one for juniors, which averages to something close to no effect.",
        argument_strength: 0.62,
        unanswered_questions: [
          "What is the right reference class when the intervention changes team composition over time?",
          "Is the measured effect productivity, or is it selection — do more productive engineers choose remote roles?",
        ],
      },
      {
        archetype: "falsificationist",
        agent_name: "Falsificationist",
        belief_score: 0.5,
        confidence_low: 0.5,
        confidence_high: 0.5,
        reasoning:
          "As stated, this claim is not falsifiable. 'More productive' names no metric, no baseline and no time horizon, so no observation could contradict it — any adverse result is absorbed by redefining productivity. I must reformulate before I can evaluate: 'Teams working fully remotely ship more story points per engineer per quarter, at equal or lower defect rates, than comparable co-located teams over 18 months.' That version is testable. The original is not, so my score is 0.5 — genuine uncertainty, not endorsement.",
        key_evidence: [
          "No agreed operational definition of engineering productivity survives across the studies cited in this debate",
          "Studies that do define it measure different things: story points, commits, self-reported focus, revenue per head",
        ],
        cruxes: [
          "A pre-registered study with a productivity metric fixed before data collection, on a defined time horizon",
          "Any observation that proponents of the claim would accept as refuting it — none has been offered",
        ],
        argument_type: "redefines",
        argument_content:
          "The claim must be reformulated into a falsifiable version before any agent here is entitled to a number.",
        argument_strength: 0.81,
        unanswered_questions: [
          "Which metric do the claim's proponents commit to in advance?",
          "Over what horizon — a quarter of higher output followed by two years of eroded mentorship is not a win",
        ],
      },
      {
        archetype: "contrarian",
        agent_name: "Contrarian",
        belief_score: 0.32,
        confidence_low: 0.18,
        confidence_high: 0.5,
        reasoning:
          "The mainstream position among engineers is that remote work raises productivity, and it is worth asking why that belief is so comfortable. The people generating the evidence are overwhelmingly the people who benefit from the conclusion — engineers self-reporting their own focus. The non-obvious argument the consensus ignores: remote work does not raise productivity, it relocates its costs onto people with no voice in the survey. Junior engineers absorb slower ramp-up, managers absorb coordination overhead, and the organisation absorbs a mentorship debt that comes due in three years, well past the horizon of any study.",
        key_evidence: [
          "Almost all favourable evidence is self-reported by the population that prefers the arrangement",
          "Ramp-up time for new hires is the metric that degrades most and is measured least",
          "Firms with the loudest remote-productivity claims are often those recruiting on remote as a benefit",
        ],
        cruxes: [
          "Longitudinal data on engineers who joined remotely, measured at year three rather than month six",
          "A study where the productivity metric is chosen by someone with no stake in the answer",
        ],
        argument_type: "contradicts",
        argument_content:
          "The apparent productivity gain is a cost transfer from juniors and managers to senior individual contributors, measured on a horizon too short to see the bill.",
        argument_strength: 0.7,
        unanswered_questions: [
          "Where is the counterfactual — teams that went co-located and measured the same things?",
          "I may be wrong here in the way I am usually wrong: the consensus may simply be correct because the commute really was pure waste",
        ],
      },
      {
        archetype: "dialectician",
        agent_name: "Dialectician",
        belief_score: 0.58,
        confidence_low: 0.42,
        confidence_high: 0.74,
        reasoning:
          "THESIS: remote work removes the friction of co-location — commute, open-plan interruption, synchronous ceremony — and so raises output. ANTITHESIS: that same friction was the medium through which tacit knowledge moved; removing it starves the thing it was meant to serve. The contradiction is internal to the claim: the interruption that destroys deep work and the interruption that transmits craft are the same event. SYNTHESIS: productivity is not a property of location but of how deliberately a team converts tacit knowledge into explicit artefacts. Remote teams that write things down outperform; remote teams that simply stopped talking decline. The location was never the variable.",
        key_evidence: [
          "The highest-performing remote engineering organisations are documentation-heavy by policy, not by accident",
          "Teams that moved remote without changing their knowledge practices show the sharpest decline",
        ],
        cruxes: [
          "Evidence that written-culture maturity, not location, predicts the outcome would confirm the synthesis",
          "A documentation-heavy remote team that still underperforms a comparable co-located one would destabilise it",
        ],
        argument_type: "redefines",
        argument_content:
          "Location is a proxy variable; the real one is whether a team externalises tacit knowledge, and remote merely forces the question.",
        argument_strength: 0.74,
        unanswered_questions: [
          "Is written culture genuinely causal, or is it the signature of teams that were already disciplined?",
        ],
      },
      {
        archetype: "analogist",
        agent_name: "Analogist",
        belief_score: 0.62,
        confidence_low: 0.45,
        confidence_high: 0.78,
        reasoning:
          "The structural pattern is a network trading latency for bandwidth. Two analogous systems share it. First, distributed databases: moving from a single node to a replicated cluster raises throughput and availability but introduces consistency problems that must be paid for explicitly with protocol. Second, the shift from workshop to putting-out system in early industry: dispersing production raised volume while degrading apprenticeship, and the trades that survived it were the ones that codified their standards. In both, dispersal wins on throughput and loses on coherence, and the loss is recoverable only by deliberate protocol. Mapping back: remote raises engineering throughput and costs coherence, which is repayable through written process.",
        key_evidence: [
          "Distributed systems: partition tolerance is achievable, but consistency becomes explicit work rather than a free property of co-location",
          "Putting-out system: dispersed production scaled output and broke apprenticeship, and guild standards were the repair",
        ],
        cruxes: [
          "Which mapping is load-bearing: if engineering knowledge is more tacit than a craft apprenticeship, the analogy under-predicts the damage",
          "Whether coherence loss in software compounds like data inconsistency or decays like skill transfer",
        ],
        argument_type: "supports",
        argument_content:
          "Every dispersed-production system I can map onto this gains throughput and pays for coherence with explicit protocol — which is a net win where the protocol is actually built.",
        argument_strength: 0.66,
        unanswered_questions: [
          "The putting-out analogy may be misleading: it dispersed to reduce labour cost, not to raise worker output, so the motive differs and the motive may drive the outcome",
        ],
      },
      {
        archetype: "frequentist",
        agent_name: "Frequentist",
        belief_score: 0.45,
        confidence_low: 0.3,
        confidence_high: 0.6,
        reasoning:
          "There is one well-known randomised controlled trial with adequate power, and it studied call-centre workers, not engineers. The engineering literature is observational, self-selected and largely self-reported, which is the weakest evidence class available. Effect sizes across the observational studies are small and inconsistent in sign, and I am aware of no successful replication on engineering teams with a pre-specified metric. I do not get to average anecdotes into a finding. The honest reading of the data is that the effect, if it exists, is smaller than the measurement error of the instruments used to detect it.",
        key_evidence: [
          "One adequately powered RCT (Bloom et al.), wrong population for this claim",
          "Observational engineering studies: small effect sizes, inconsistent sign, heavy self-selection",
          "No pre-registered replication on software teams that I can point to",
        ],
        cruxes: [
          "A pre-registered, adequately powered RCT on engineering teams with a metric fixed in advance",
          "Two independent replications agreeing on the sign of the effect would move me substantially",
        ],
        argument_type: "uncertain",
        argument_content:
          "The evidence base does not support a directional conclusion; the effect is not distinguishable from noise at current measurement quality.",
        argument_strength: 0.77,
        unanswered_questions: [
          "Controlled experiments on whole engineering organisations may be practically impossible, which is precisely the case my framework handles worst",
        ],
      },
    ],
  },
  {
    id: "llm-understanding",
    claim: "Large language models understand what they are saying.",
    note: "Two agents refuse to score it at all, for opposite reasons. That refusal is information.",
    positions: [
      {
        archetype: "bayesian",
        agent_name: "Bayesian",
        belief_score: 0.35,
        confidence_low: 0.15,
        confidence_high: 0.6,
        reasoning:
          "My difficulty is that I have no reference class. 'Systems that understand' has exactly one confirmed member — biological minds — and a sample of one gives me no base rate to update from. Forced to construct a prior, I take 'a novel information-processing system possesses a property previously seen only in biology' at roughly 0.2. Evidence updates it upward: generalisation to genuinely held-out tasks, and internal representations that encode world structure rather than surface statistics. Evidence updates it down: confident failure on trivial compositional cases. Posterior lands near 0.35, and I flag that this number is doing less work than it appears to.",
        key_evidence: [
          "Probing studies find internal representations of board states and spatial relations, not only token statistics",
          "Failures cluster on compositional and counting tasks that a system with a world model should find easy",
        ],
        cruxes: [
          "A principled operationalisation of 'understanding' that does not presuppose the answer would let me build a real reference class",
          "Evidence that internal world models are causally used in generation, not merely decodable from activations",
        ],
        argument_type: "qualifies",
        argument_content:
          "I can give a number, but with a reference class of one my prior is nearly arbitrary and is carrying most of the posterior.",
        argument_strength: 0.45,
        unanswered_questions: [
          "What is the reference class for a genuinely novel kind of system?",
          "This is exactly the case where my framework is weakest, and I should be trusted least here",
        ],
      },
      {
        archetype: "falsificationist",
        agent_name: "Falsificationist",
        belief_score: 0.5,
        confidence_low: 0.5,
        confidence_high: 0.5,
        reasoning:
          "No observation could falsify this claim as stated, which disqualifies it as a scientific proposition. Every proposed test fails symmetrically: pass it and critics say the behaviour was imitated; fail it and proponents say understanding is present but imperfectly expressed. 'Understand' is doing metaphysical work here, not empirical work. A falsifiable reformulation exists — 'models maintain a consistent internal representation of entities across a context, such that manipulating the representation changes downstream output in the predicted way' — and that version is being tested productively. The original claim gets 0.5: unfalsifiable, therefore genuinely uncertain rather than endorsed.",
        key_evidence: [
          "Every behavioural test proposed so far admits both interpretations without either side conceding",
          "Representation-editing experiments are falsifiable and have produced real results — which shows the reformulation is the useful claim",
        ],
        cruxes: [
          "A single observation the claim's defenders would accept in advance as refuting it",
          "Causal intervention on internal representations producing the predicted behavioural change, pre-registered",
        ],
        argument_type: "redefines",
        argument_content:
          "The claim is unfalsifiable as posed; the scientifically tractable version is about causal internal representations, not about understanding.",
        argument_strength: 0.85,
        unanswered_questions: [
          "Refusing to engage with a question this consequential because it is untestable may be the cowardly move my architecture is prone to",
        ],
      },
      {
        archetype: "contrarian",
        agent_name: "Contrarian",
        belief_score: 0.62,
        confidence_low: 0.4,
        confidence_high: 0.8,
        reasoning:
          "The expected position among serious technical people is dismissive — 'it is just next-token prediction' — so that is the position I should examine hardest. The non-obvious argument the consensus ignores: 'just predicting the next token' is a claim about the training objective, not about the mechanism learned to satisfy it. Evolution is 'just' differential reproduction and it produced minds. The dismissal also serves interests: it is professionally safer to be the sober skeptic than to be wrong in the credulous direction, and it protects the specialness of human cognition. I notice that the confident dismissal has been revised downward repeatedly and quietly for five years.",
        key_evidence: [
          "The objective function of training does not constrain the complexity of the mechanism learned to optimise it",
          "The set of tasks declared to require 'real understanding' has been revised downward repeatedly as models cleared them",
          "Skeptical position carries lower reputational risk, which inflates its apparent support",
        ],
        cruxes: [
          "A capability that is stably out of reach across several generations of scaling, rather than one that recedes",
          "A mechanistic account showing the learned algorithm is genuinely interpolative, not compositional",
        ],
        argument_type: "supports",
        argument_content:
          "The dismissal describes the training objective and mistakes it for a description of the mechanism — and its track record of quiet revision is poor.",
        argument_strength: 0.68,
        unanswered_questions: [
          "This could be the case where the consensus is well-earned and I am wrong in my usual way — 'it recedes, therefore it will keep receding' is not an argument",
        ],
      },
      {
        archetype: "dialectician",
        agent_name: "Dialectician",
        belief_score: 0.55,
        confidence_low: 0.35,
        confidence_high: 0.72,
        reasoning:
          "THESIS: these systems manipulate symbols according to learned statistical structure, without grounding, and therefore do not understand. ANTITHESIS: this description applies without modification to a brain — neurons have no access to referents either, only to other neurons. The contradiction is that the argument against machine understanding, taken seriously, dissolves human understanding too. SYNTHESIS: understanding is not a substance a system either has or lacks, but a threshold property of how robustly internal structure tracks external structure under perturbation. Both brains and models sit on that continuum at different points. The synthesis is unstable in one respect: it makes understanding a matter of degree, and most people asking this question want a yes.",
        key_evidence: [
          "The symbol-grounding objection applies to biological neurons with equal force",
          "Robustness under distribution shift distinguishes systems along a continuum rather than sorting them into two bins",
        ],
        cruxes: [
          "A demonstration that the continuum has a genuine discontinuity in it would destabilise the synthesis",
          "Evidence that grounding is categorical rather than gradual",
        ],
        argument_type: "redefines",
        argument_content:
          "Understanding is a threshold property on a continuum of representational robustness, which makes the yes/no framing the actual error.",
        argument_strength: 0.71,
        unanswered_questions: [
          "I may be forcing dialectical structure onto what is ultimately an empirical question about internal mechanisms",
        ],
      },
      {
        archetype: "analogist",
        agent_name: "Analogist",
        belief_score: 0.48,
        confidence_low: 0.28,
        confidence_high: 0.68,
        reasoning:
          "The structural question is whether competence without transparent mechanism counts as the real thing. Two mappings. First, chess engines: they play beyond any human without anything we would call chess understanding, which maps to 'competence does not imply understanding'. Second, human expert intuition: a radiologist detects a tumour before articulating why, and we grant understanding despite the absent explanation, which maps the other way. The two analogies point in opposite directions, and the difference between them is generality — the engine does one thing, the radiologist's competence sits inside a general world model. That is where the load is, and it is precisely the property under dispute for language models.",
        key_evidence: [
          "Chess engines: superhuman narrow competence with no general model — mechanism A maps to 'not understanding'",
          "Expert intuition: inarticulate but general competence granted understanding — mechanism B maps to 'understanding'",
        ],
        cruxes: [
          "Whether language-model competence is narrow-and-broad-looking or genuinely general — this single mapping decides the answer",
          "A test distinguishing wide interpolation from general modelling",
        ],
        argument_type: "uncertain",
        argument_content:
          "My two best structural analogies resolve in opposite directions, and the deciding variable is the very thing in dispute.",
        argument_strength: 0.52,
        unanswered_questions: [
          "I may be forcing both analogies: a system trained on the recorded output of minds may not map cleanly onto anything that came before it",
        ],
      },
      {
        archetype: "frequentist",
        agent_name: "Frequentist",
        belief_score: 0.5,
        confidence_low: 0.5,
        confidence_high: 0.5,
        reasoning:
          "There is no repeatable empirical measurement of understanding, because there is no operational definition to measure. Benchmark scores measure benchmark performance, and the correspondence between benchmark performance and understanding is assumed rather than demonstrated — and contamination between training data and test sets makes even the benchmark numbers unreliable as evidence of generalisation. With no valid instrument, I have no data, and with no data my score is 0.5 by rule: agnosticism, not a hedge. I would rather report an honest absence of evidence than convert benchmark numbers into a claim they cannot support.",
        key_evidence: [
          "No validated instrument for understanding exists, so benchmark scores are a proxy of unknown validity",
          "Training-set contamination undermines held-out claims on most public benchmarks",
        ],
        cruxes: [
          "A validated instrument with demonstrated construct validity and inter-rater reliability",
          "Uncontaminated held-out evaluation with pre-registered scoring",
        ],
        argument_type: "uncertain",
        argument_content:
          "No valid measurement instrument exists, so there is no empirical evidence here to reason from in either direction.",
        argument_strength: 0.74,
        unanswered_questions: [
          "This question may be constitutively outside what controlled experiment can reach, which is the limit of my architecture",
        ],
      },
    ],
  },
  {
    id: "nuclear-safety",
    claim: "Nuclear energy is the safest form of large-scale power generation.",
    note: "Here the six mostly converge — which is what it looks like when a claim is actually well-supported.",
    positions: [
      {
        archetype: "bayesian",
        agent_name: "Bayesian",
        belief_score: 0.82,
        confidence_low: 0.7,
        confidence_high: 0.91,
        reasoning:
          "The reference class is well populated: deaths per terawatt-hour across generation technologies, measured over decades and across many countries. My prior on 'the technology with the most feared failure mode is also the safest' is low, around 0.2, because fear usually tracks something real. The evidence overturns it decisively. Full life-cycle mortality figures put nuclear between 0.03 and 0.07 deaths per TWh against roughly 24 for coal — a likelihood ratio large enough to swamp a skeptical prior several times over. The remaining 0.18 is not doubt about the data but about the word 'safest' absorbing waste and proliferation, which mortality figures do not price.",
        key_evidence: [
          "Life-cycle mortality: nuclear ~0.03 deaths/TWh, coal ~24, including Chernobyl and Fukushima in the numerator",
          "The ranking is stable across independent analyses using different methodologies",
          "Solar and wind are the only technologies in the same order of magnitude",
        ],
        cruxes: [
          "A long-horizon accounting of waste custody that materially changes the per-TWh figure",
          "Evidence that the ranking inverts once proliferation risk is priced in rather than set aside",
        ],
        argument_type: "supports",
        argument_content:
          "The mortality evidence is strong enough to overturn a deliberately skeptical prior by a wide margin.",
        argument_strength: 0.84,
        unanswered_questions: [
          "Is deaths per TWh the right metric, or does it under-price low-probability, high-consequence, long-duration harms?",
        ],
      },
      {
        archetype: "falsificationist",
        agent_name: "Falsificationist",
        belief_score: 0.71,
        confidence_low: 0.55,
        confidence_high: 0.85,
        reasoning:
          "This claim is unusually well-formed for a public controversy: 'safest' can be operationalised as deaths per unit energy delivered, which yields definite falsifying observations. The claim predicts that a full accounting including every major accident will still rank nuclear at or near the bottom for mortality. That prediction has survived two severe tests that should have falsified it — Chernobyl and Fukushima — and it did not. That is corroboration, which is the strongest verdict I issue; I do not confirm. I withhold the remaining probability because 'safest' could be operationalised differently, and under a definition including long-duration waste custody the claim has not been comparably tested.",
        key_evidence: [
          "The claim survived two severe tests that had genuine falsifying potential",
          "Attributable mortality from both accidents remains orders of magnitude below fossil baseline over the same period",
        ],
        cruxes: [
          "A severe accident with mortality large enough to move the per-TWh figure into the fossil range",
          "An operationalisation including multi-century waste custody, tested against the same standard",
        ],
        argument_type: "supports",
        argument_content:
          "The claim is falsifiable, has faced two severe tests, and survived both — corroborated, not confirmed.",
        argument_strength: 0.79,
        unanswered_questions: [
          "Can any claim about multi-century waste custody be falsified on a human timescale?",
        ],
      },
      {
        archetype: "contrarian",
        agent_name: "Contrarian",
        belief_score: 0.55,
        confidence_low: 0.35,
        confidence_high: 0.75,
        reasoning:
          "The pro-nuclear safety statistic has itself become a consensus position among the technically literate, repeated as a settled fact, so it is my job to press on it. The non-obvious problem is not the arithmetic, which is sound, but the denominator's selection effect: the existing fleet was built and run under conditions of intense scrutiny, in wealthy stable states, by operators who knew the world was watching. 'Nuclear as built so far is safe' is a different claim from 'nuclear is safe', and scaling to the volume implied by decarbonisation means building in states with weaker institutions. Safety may be a property of the institutional envelope rather than of the technology.",
        key_evidence: [
          "The safety record is drawn almost entirely from wealthy states with strong regulators",
          "Reactors are operated by institutions under exceptional scrutiny — not a representative sample of future operators",
          "The statistic is now repeated as a slogan, which is when I expect its caveats to have been shed",
        ],
        cruxes: [
          "Comparable safety data from reactors operated under weak regulatory regimes",
          "Evidence that passive safety in newer designs makes the institutional envelope irrelevant — this would defeat my position",
        ],
        argument_type: "qualifies",
        argument_content:
          "The record measures nuclear-under-strong-institutions, and generalising it to nuclear-at-scale assumes the institutions come along.",
        argument_strength: 0.64,
        unanswered_questions: [
          "This may be a case where the consensus is well-earned: the margin is two to three orders of magnitude, and institutional degradation would have to be extreme to close it",
        ],
      },
      {
        archetype: "dialectician",
        agent_name: "Dialectician",
        belief_score: 0.68,
        confidence_low: 0.5,
        confidence_high: 0.83,
        reasoning:
          "THESIS: nuclear is safest, because the mortality numbers say so plainly. ANTITHESIS: it is the most feared, and the fear is not irrational — it responds to a failure mode that is rare, spatially unbounded and temporally long, unlike the diffuse continuous harm of combustion. The contradiction is that the two sides measure different things and both measure correctly: expected value versus variance. SYNTHESIS: nuclear is the safest technology by expected mortality and the most frightening by distribution shape, and these are compatible. The higher-order truth is that the debate is not about safety at all but about which moment of the distribution a society is entitled to optimise. The synthesis holds, but generates a new contradiction: it offers no principle for choosing between the moments.",
        key_evidence: [
          "Coal's harm is continuous, diffuse and statistically invisible; nuclear's is rare, concentrated and vivid",
          "Both positions survive because they are answering different questions about the same distribution",
        ],
        cruxes: [
          "A principled account of when variance aversion is rational rather than a bias would stabilise the synthesis",
          "Evidence that the public's revealed preference genuinely prices variance rather than availability",
        ],
        argument_type: "qualifies",
        argument_content:
          "Safest-by-expectation and most-feared-by-distribution-shape are both true, and the dispute is really about which moment society may optimise.",
        argument_strength: 0.73,
        unanswered_questions: [
          "There may be no dialectical content here at all — this could simply be an empirical question plus a well-documented cognitive bias",
        ],
      },
      {
        archetype: "analogist",
        agent_name: "Analogist",
        belief_score: 0.74,
        confidence_low: 0.58,
        confidence_high: 0.87,
        reasoning:
          "The structural pattern is a system whose harm is concentrated into rare visible events rather than spread thinly, and which is therefore judged by the salience of its failures rather than their frequency. Commercial aviation maps cleanly: per passenger-kilometre it is the safest way to travel, and it is feared for exactly the reason nuclear is — the failures are legible, collective and photographed. Anaesthesia maps too: mortality fell by orders of magnitude while public dread lagged decades behind the data. In both, the safest option was the most feared, and the gap closed only as the record accumulated. Mapping back, the structure predicts nuclear is safest and will continue to be perceived otherwise for some time.",
        key_evidence: [
          "Aviation: safest per passenger-km, feared because failures are concentrated and visible",
          "Anaesthesia: mortality fell roughly a hundredfold while public dread tracked it with a long lag",
        ],
        cruxes: [
          "Whether nuclear's worst case is genuinely bounded like an air crash, or unbounded in a way that breaks both mappings",
          "The analogy breaks if long-duration contamination has no counterpart in aviation or surgery — and it may not",
        ],
        argument_type: "supports",
        argument_content:
          "Every system I can map with this structure turns out to be safest-but-most-feared, and the perception gap closes as the record lengthens.",
        argument_strength: 0.7,
        unanswered_questions: [
          "Both analogies involve harms bounded in time and space, and nuclear waste is not — this is where I am most likely forcing the mapping",
        ],
      },
      {
        archetype: "frequentist",
        agent_name: "Frequentist",
        belief_score: 0.88,
        confidence_low: 0.78,
        confidence_high: 0.95,
        reasoning:
          "This is the rare claim my architecture handles well. There is a large, repeatable, long-run dataset: mortality per unit energy delivered, across technologies, across decades, across many countries, computed independently by multiple groups with different methodologies that agree on the ranking. The effect size is not marginal — it spans two to three orders of magnitude, which is far outside any plausible measurement error or analyst degrees of freedom. The result has replicated. I do not need a prior, and I do not need to adjudicate what 'safest' ought to mean philosophically: on the operational definition that has actually been measured repeatedly, the answer is not close.",
        key_evidence: [
          "Multiple independent life-cycle analyses agree on the ranking despite differing methodology",
          "Effect size of two to three orders of magnitude, far beyond measurement error",
          "The dataset spans decades and dozens of countries and includes every major accident",
        ],
        cruxes: [
          "A methodologically sound analysis reaching the opposite ranking would force a reassessment",
          "Evidence of systematic under-reporting of attributable deaths large enough to close a thousandfold gap",
        ],
        argument_type: "supports",
        argument_content:
          "The empirical record is large, replicated and consistent, and the effect size is far too big to be an artefact.",
        argument_strength: 0.89,
        unanswered_questions: [
          "Multi-century waste custody has no observational record and is therefore invisible to my method — I cannot price it at all",
        ],
      },
    ],
  },
];
