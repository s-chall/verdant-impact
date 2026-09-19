# Verdant — Product Specification

## 1. Product definition

Verdant is a proof-of-impact funding platform for environmental philanthropy. A donor funds a measurable project milestone, follows active environmental observations, and sees whether independent evidence supports the project's claim.

Verdant is not a donation directory, an ESG score, or a blockchain explorer. Its defining product is the evidence-gated funding loop connecting money, environmental measurement, human judgment, and a permanent record.

### One-line pitch

Fund environmental change, then watch the evidence prove—or refuse to prove—that it happened.

### Product promise

Every visible impact claim must answer four questions:

1. What changed?
2. How was it measured?
3. Who or what verified it?
4. What happened to the funding because of that decision?

## 2. Problem

Environmental philanthropy usually ends with a receipt and later produces stories, photographs, or annual reports. Donors cannot continuously evaluate whether their contribution caused measurable change. Environmental data exists, but it is fragmented, technical, and disconnected from funding decisions.

Blockchain can prove that money moved. It cannot prove that a forest grew, a coastline stabilized, a reef recovered, or a solar installation generated power. Verdant connects the financial record to an explicit environmental evidence process.

## 3. Product principles

### Proof before promises

An attractive image is never treated as verified impact.

### Refusal is a feature

The system must visibly refuse verification when evidence is missing, contradictory, stale, or outside the project boundary.

### One claim, multiple sources

A milestone normally requires at least two independent evidence types, such as satellite imagery plus a field survey or installation imagery plus a signed utility reading.

### Plain language first

The primary interface explains environmental change without requiring the donor to understand remote-sensing indices. Scientific detail remains inspectable.

### Trace every conclusion

Every result exposes its source, date, project boundary, calculation, confidence, assumptions, reviewer, and on-chain record.

### Blockchain records decisions, not truth

Environmental evidence establishes whether a claim is justified. Solana preserves funding state, evidence hashes, reviewer decisions, and milestone releases.

## 4. Users

### Donor or philanthropist

- Discovers projects by place and desired outcome.
- Funds a defined milestone.
- Watches the project through understandable visual evidence.
- Receives updates when evidence arrives, is rejected, or is verified.
- Sees their proportional contribution rather than an exaggerated attribution claim.

### Project operator

- Registers the organization, project boundary, milestones, wallet, and evidence sources.
- Submits field evidence and responds to missing-data requests.
- Receives milestone funding only after the configured evidence gate passes.

### Reviewer

- Inspects source observations, model output, calculations, anomalies, and previous decisions.
- Approves, rejects, disputes, or requests additional evidence.
- Signs a reasoned decision that can be anchored on-chain.

### Institutional funder

- Creates or joins milestone pools.
- Monitors a portfolio across projects and years.
- Exports defensible evidence and funding histories.

## 5. Core product loop

```text
Discover a project
        ↓
Understand its measurable milestone
        ↓
Fund a milestone vault
        ↓
Monitor active environmental conditions
        ↓
Collect scheduled satellite, sensor, and field evidence
        ↓
Run visible evidence agents
        ↓
Verify, refuse, dispute, or request more evidence
        ↓
Human reviewer signs the decision
        ↓
Record the evidence hash and release state on Solana
        ↓
Show the donor what changed and what remains uncertain
```

## 6. Standout product features

These features should dominate the redesign. Supporting portfolio and discovery surfaces exist to lead users into them.

### 6.1 Evidence-gated funding

Funding is assigned to an explicit milestone rather than a vague project promise. A milestone defines its target, boundary, baseline, deadline, required evidence, reviewer policy, and release or refund behavior.

The interface must always connect the evidence decision to the money state:

- Awaiting evidence
- Analysis running
- More evidence required
- Human review
- Verified and releasable
- Disputed
- Rejected or refundable

### 6.2 Cinematic Evidence Studio

The Evidence Studio makes normally invisible analysis understandable and compelling.

It must show:

- Baseline and current observations
- Project boundary
- Observation dates and source metadata
- Relevant measurement layer such as NDVI
- Visible sequential agent execution
- Change or anomaly masks when available
- Missing or conflicting inputs
- Plain-language conclusion
- Confidence and uncertainty
- Human-review requirement
- Resulting funding state

The studio must be equally good at showing success and refusing an unsupported claim.

### 6.3 Active environmental intelligence

Verdant continuously displays live context that determines when and how evidence should be collected.

Current examples:

- Demak coast: cloud cover, rain, and wind
- Great Barrier Reef: sea-surface temperature and wave height
- Arizona solar: irradiance and cloud cover
- Global context: NASA EONET environmental events
- Funding context: Solana finality

These values are observations, not proof of project impact. The interface must explain how each value affects evidence collection or interpretation.

### 6.4 Visible refusal states

Verdant should make a trustworthy negative result memorable. When required evidence is missing, the interface should state:

- What is available
- What is missing
- Why the existing evidence is insufficient
- What data would allow analysis to continue
- Whether funding remains locked, expires, or becomes refundable

### 6.5 Visual impact portfolio

The portfolio replaces financial return with environmental change. It should prioritize maps, timelines, before-and-after imagery, evidence states, and milestone journeys over dense numeric dashboards.

The portfolio must distinguish observed change from donor attribution. Example: “Your contribution funded 0.4% of this verified milestone,” not “you restored this coastline.”

### 6.6 Project intelligence and news

Every project automatically displays:

- Measurement signal
- Decision gate
- Active observation status
- Latest evidence state
- Project-issued updates
- Independent reporting
- Source and publication date

News ingestion must rank sources, remove duplicates, match by project and geography, and clearly separate operator announcements from independent reporting.

## 7. Three-project rule

A reusable platform feature is not considered complete until it works on three projects. A scientific analysis model is not assumed to transfer across unrelated environmental systems.

For the standalone MVP, use three projects from one repeatable category: coastal vegetation or mangrove restoration. This proves that onboarding, scheduling, observation ingestion, analysis, review, and funding release can be repeated.

The current cross-domain projects remain useful demonstrations of the evidence framework:

| Project type | Primary signal | Independent evidence | Example release gate |
| --- | --- | --- | --- |
| Coastal restoration | Vegetation and shoreline change | Satellite imagery plus field survey | Calibrated change threshold and reviewer approval |
| Reef restoration | Heat stress and coral condition | Marine observations plus diver survey | Survey confirms survival after thermal-risk check |
| Community solar | Installed area and power output | Installation imagery plus signed meter data | Installation match and generation threshold |

## 8. Truth model

All project claims use a controlled state vocabulary:

- **Observed:** a source delivered a new signal.
- **Analysis running:** automated checks are executing.
- **More evidence needed:** one or more required inputs are missing.
- **Human review:** automated analysis produced a recommendation.
- **Verified:** an authorized reviewer accepted the evidence.
- **Disputed:** evidence or reviewer decisions conflict.
- **Rejected:** the milestone did not satisfy its rule.
- **Verification expired:** the evidence is too old for the current claim.

“Live,” “healthy,” and “connected” describe source availability only. They must never imply verified impact.

## 9. Primary screens

### Portfolio

Purpose: show the donor where their funding is active and what changed.

Must prioritize:

- Portfolio globe or map
- Current milestone states
- Recent evidence decisions
- Proportional donor attribution
- Direct path into Evidence Studio

### Discover

Purpose: compare projects by location, outcome, evidence readiness, and milestone.

Must show the measurable claim before the funding CTA.

### Project detail

Purpose: explain the project, measurement plan, funding state, evidence history, and news.

Must include:

- Project operator and location
- Official monitoring boundary status
- Milestone target and rule
- Evidence requirements
- Current funding state
- Evidence timeline
- Sourced project intelligence
- Fund action

### Evidence Monitor

Purpose: expose active data sources and new observations across the portfolio.

Must separate:

- Live environmental context
- New evidence inputs
- Analysis recommendations
- Verified decisions
- On-chain records

### Evidence Studio

Purpose: make one claim fully inspectable and let the user understand why it passed or failed.

### Impact Ledger

Purpose: connect contributions, evidence decisions, releases, refunds, and Solana transaction records in chronological order.

### Reviewer console

Purpose: inspect source material and sign a reasoned decision. This is required for production but not yet implemented.

## 10. Data and sponsor architecture

### Environmental intelligence — OPEF track

- Sentinel-2 and Landsat imagery
- STAC catalog metadata
- Vegetation, shoreline, water, heat, and installation measurements
- Open-Meteo atmospheric and marine conditions
- NASA EONET environmental events
- Field, drone, sensor, and meter inputs
- Evidence agents that inspect, compare, explain, and refuse

### Verifiable funding — Solana track

- Phantom wallet authentication
- USDC contribution transactions
- Project milestone vaults
- Reviewer authority policy
- Evidence manifest hashes
- Release, rejection, dispute, and refund states
- Explorer links and duplicate-release protection

### Philanthropic outcomes — Bloomberg track

- Understandable project goals
- Clear connection between funding and measurable milestones
- Multi-year monitoring
- Plain-language evidence summaries
- Honest attribution and uncertainty
- Portfolio reporting for individuals and institutions

### Identity — GoDaddy track

Register a short, memorable domain after confirming the final product name. The domain should lead directly to the active product rather than a separate marketing page.

## 11. Core data model

### Project

- Project ID
- Operator organization
- Name and description
- Environmental category
- Official boundary and boundary status
- Location
- Project wallet
- Evidence-source configuration
- News-matching terms

### Milestone

- Milestone ID
- Project ID
- Measurable target
- Baseline
- Deadline
- Required evidence types
- Threshold calculation
- Reviewer policy
- Vault address
- Funding target and current amount
- Release and refund rules

### Observation

- Source
- Acquisition time
- Geographic coverage
- Resolution
- Quality metrics
- Raw-asset reference
- Processing version
- Provenance hash

### Evidence run

- Input observations
- Project boundary version
- Agent and model versions
- Measurements
- Change and anomaly masks
- Confidence and uncertainty
- Missing-evidence list
- Recommendation
- Evidence-manifest hash

### Review decision

- Reviewer identity
- Decision
- Reasoning
- Timestamp
- Signed evidence-manifest hash
- Resulting milestone state
- Solana transaction reference

### Contribution

- Donor wallet
- Milestone vault
- Amount and asset
- Transaction signature
- Proportional milestone attribution
- Release or refund state

## 12. Current implementation

The current application demonstrates:

- Visual portfolio and rotatable project globe
- Project discovery
- Phantom signed-message login prototype
- Real Sentinel-2 Demak observations from 2017 and 2021
- NDVI visualization
- Six-stage visible evidence-agent experience
- Human-review gating
- Correct refusal paths for reef and solar cases
- Live project conditions from weather and marine sources
- NASA EONET event monitoring
- Solana devnet finality monitoring
- Project-specific evidence requirements
- Curated, sourced project intelligence

Current limitations:

- Project configuration is embedded in frontend code.
- Satellite observations are packaged rather than automatically scheduled.
- Agent execution is a product simulation, not validated model inference.
- Solana milestone vaults are not yet deployed.
- Authentication is not server verified.
- News is curated rather than automatically ingested.
- Reviewer and operator interfaces are missing.
- Some legacy prototype copy must be converted to the controlled truth states.

## 13. Standalone MVP scope

The first operational release should focus on coastal vegetation restoration and support three real projects end to end.

### Required capabilities

1. Database-backed projects and milestones
2. Project onboarding with an official GeoJSON boundary
3. Automated Sentinel observation search and selection
4. Cloud and shadow masking
5. NDVI and vegetation-area measurement
6. Baseline and current change masks
7. Evidence provenance manifest
8. Reviewer console
9. Solana devnet milestone vault
10. Evidence-hash anchoring
11. Milestone release and refund paths
12. Donor attribution
13. Scheduled monitoring
14. Automatically refreshed project intelligence

## 14. Measurement requirements

Every measurement displayed to users must include:

- Unit and human-readable translation
- Geographic boundary
- Baseline date
- Observation date
- Source
- Method and model version
- Quality checks
- Confidence or uncertainty
- Required corroborating evidence
- Reviewer state

A score without this context must not control a funding decision.

## 15. Design requirements

- Put proof, current evidence state, and funding consequence before decorative portfolio statistics.
- Prefer maps, imagery, timelines, masks, and progression states to raw numbers.
- Keep the primary outcome understandable without a click.
- Allow deeper scientific detail through progressive disclosure.
- Make source metadata and uncertainty easy to inspect.
- Give missing-evidence and refusal states the same visual quality as successful verification.
- Use animation to reveal system reasoning, never to imply certainty.
- Preserve the cartoonish warmth while grounding maps, boundaries, dates, and observations in real geography.
- Avoid financial-market language when it suggests profit or tradable environmental outcomes.

## 16. Demo sequence

1. Open the portfolio and select Demak Coastal Recovery.
2. Show the measurable signal and release gate before funding.
3. Open sourced project intelligence.
4. Enter Evidence Studio.
5. Switch between the 2017 and 2021 Sentinel observations.
6. Reveal the NDVI layer.
7. Run the evidence agents.
8. Show that the result stops at human review.
9. Open reef or solar and demonstrate a correct refusal caused by missing independent evidence.
10. Open Evidence Monitor to show live project conditions, NASA events, and Solana finality.
11. Explain that the next implementation connects the accepted evidence manifest to a milestone vault release.

## 17. Success metrics

### Trust

- Percentage of visible claims with complete provenance
- Percentage of evidence runs that expose uncertainty
- Reviewer disagreement rate
- False-positive and false-negative rate by model version

### Product

- Time from opening a project to understanding its measurable goal
- Percentage of donors who inspect evidence before funding
- Evidence-update return rate
- Milestone follow-through rate across multiple years

### Operations

- Observation-ingestion success rate
- Median time from observation to recommendation
- Percentage of milestones requiring additional evidence
- Median reviewer turnaround time
- On-chain release or refund success rate

## 18. Delivery phases

### Phase 1 — Credible evidence

Automated imagery ingestion, repeatable analysis across three coastal projects, provenance manifests, and reviewer workflow.

### Phase 2 — Credible funding

Solana milestone vaults, USDC contributions, evidence-hash records, release, dispute, and refund behavior.

### Phase 3 — Repeatable platform

Project onboarding, scheduled monitoring, organization accounts, notifications, and automated news ingestion.

### Phase 4 — Additional environmental modules

Add solar, forest, wetland, water-quality, reef, and biodiversity modules only with domain-specific measurements, evaluation data, and evidence rules.

## 19. North-star test

Verdant succeeds when a donor can answer this sentence without trusting Verdant's marketing:

> “I can see what this project promised, what independent evidence observed, why the claim passed or failed, who reviewed it, and what happened to my funding.”
