# Devpost copy — Verdant

Paste these blocks into Devpost. Keep the honesty: agents are a visible pipeline, not a trained remote-sensing model, and Solana vaults are not deployed yet.

---

## Tagline (≤60 characters)

Fund change, then watch evidence prove or refuse it.

**Backup:** Proof-of-impact funding for environmental philanthropy.

---

## Elevator pitch (2–3 sentences)

Environmental giving usually ends with a receipt and a later PDF. Verdant puts donor money behind an **evidence gate**: a milestone names the boundary, the signal, and the second source — then six visible agents inspect the claim and are allowed to **refuse**. A human still has to sign, and the vault stays locked until they do.

---

## Inspiration

Philanthropy can move money. Satellites, weather models, and field surveys can observe the planet. Those two systems almost never meet.

Blockchain can prove a transfer happened. It cannot prove a mangrove grew, a reef recovered, or a solar array generated power. We wanted a product where **refusal is a feature**: if the evidence is missing, stale, or only one source deep, the interface says so — and the funds do not move.

The test: a donor should be able to finish this sentence without trusting our marketing:

> I can see what this project promised, what independent evidence observed, why the claim passed or failed, who reviewed it, and what happened to my funding.

---

## What it does

Verdant is a visual **proof-of-impact portfolio** for environmental donors.

1. Discover a project by place and measurable outcome (Demak coastal recovery, reef restoration, community solar).
2. See the **measured signal** and **decision gate** before any fund CTA.
3. Open **Evidence Studio**: real Sentinel-2 2017/2021 + NDVI for Demak; an evidence recipe that correctly refuses for reef/solar.
4. Watch six agents run in sequence. They can pass, hold, or refuse.
5. Read the **funding consequence**: `Human review · vault remains locked` or `More evidence needed · vault remains locked`.
6. Optionally sign as a demo reviewer — the signature is local and **still does not release funds**.
7. Monitor live Open-Meteo conditions, NASA EONET events (labeled as observations, not proof), and Solana **devnet finality**.

Demo login: `/?demo=1` (or Explore the demo). Contribution button is **Preview contribution (demo)** — no transaction is sent.

---

## How we built it / agentic architecture

### Design rule

Agents **recommend**. They do not mint truth and they do not release money. Blockchain records **decisions**, not environmental facts.

### Pipeline (the thing to diagram on Devpost)

```text
Observations (Sentinel-2, weather, field recipe)
        ↓
   ┌─────────────────────────────────────────────┐
   │  1. Image Quality   clouds / shadows / GSD  │
   │  2. Boundary        overlap with site mask  │
   │  3. Change Detection  2017 vs 2021 / NDVI   │
   │  4. Anomaly         loss, flood, conflict   │
   │  5. Explanation     plain language for donor│
   │  6. Verification    recommend | hold | refuse│
   └─────────────────────────────────────────────┘
        ↓
Evidence manifest (JSON) → SHA-256 (local)
        ↓
Human reviewer (required) ──X──► no auto-release
        ↓
Funding state: vault remains locked
        ↓
(Next) anchor hash + reviewer signature on Solana milestone vault
```

Each agent is a **specialist with a stop condition**. Later agents do not override a missing independent source. The donor sees the same trace a reviewer would: source, date, boundary, missing inputs, recommendation, vault state.

### What is actually running today

| Layer | Implementation | Honest status |
| --- | --- | --- |
| UI / orchestration | Single-page app in `dist/index.html` | Working demo |
| Demak imagery | Packaged Sentinel-2 L2A true-color + NDVI (2017-08-27, 2021-07-27) | **Real observations** |
| Agent execution | Sequential, visible choreography (~0.7s/step) with project-specific rules | **Simulated inference** — rules are explicit, not a trained model |
| Live intel | Open-Meteo (Demak / reef / Arizona), NASA EONET, Solana `getLatestBlockhash` on **devnet** | Live observations, **not** impact proof |
| Identity | Phantom `signMessage` or Demo Explorer | Client-side only |
| Manifest | SHA-256 of a local JSON recommendation | Hash is real; **not written on-chain yet** |
| Funding | Preview amounts; vault state stays `locked` | **No USDC send, no vault program** |

### Why this is “agentic” without faking AGI

- **Division of labor:** quality vs geometry vs change vs contradiction vs language vs gate.
- **Tool-like inputs:** catalog metadata, a reconstructed monitoring boundary, NDVI layers, an evidence recipe (two-source rule).
- **Visible control flow:** the donor watches the run; failure is first-class UI.
- **Human-in-the-loop:** verification agent stops at `human_review` even when imagery authenticates.
- **Side-effect isolation:** agents cannot move money. The only side effects in the demo are a local hash, a ledger row, and an optional local reviewer signature.

---

## Challenges we ran into

- **Pretty vs true.** Early portfolio copy said “verified” and “thriving” while the studio correctly held the claim. Judges would have believed the headline. We rewrote the UI to the controlled vocabulary: Observed / Human review / More evidence needed / Vault locked.
- **Geography.** A globe pin that looked “coastal” was on Kenya, not Demak, Java. One wrong coordinate would have killed the evidence story.
- **Subtle satellite change.** The real 2017 vs 2021 pair is honest but not cinematic. We had to show dates, NDVI, and the gate — not a fake before/after filter on the same PNG.
- **Live APIs that are off-thesis.** EONET will show a Texas wildfire while you talk about Java mangroves. We label those events `Observed · not in project boundary` so they cannot be mistaken for proof.

---

## Accomplishments we’re proud of

- A 150-second path where **refusal is the climax**, not a bug: Demak holds for review; reef/solar refuse for missing independent evidence.
- Real Sentinel-2 assets in the product, not stock-photo “satellites.”
- Live environmental intelligence that **disclaims itself**.
- An evidence manifest hash the donor can see, without pretending it is already on Solana.

---

## What we learned

Impact products die when they confuse a dashboard score with a claim. The durable idea is a **gate**: two sources, a human signature, a funding state that can stay locked. Agents are how you *show* that gate working — they are not a substitute for measurement or custody.

---

## What's next

1. Three coastal projects end-to-end with official GeoJSON boundaries and scheduled Sentinel search.
2. Solana **devnet milestone vault**: USDC in, evidence-hash + reviewer signature, release or refund.
3. A real reviewer console (not a local demo button).
4. Only then: additional biomes (reef, solar, forest) with domain-specific models — no copy-paste of NDVI onto coral.

---

## Built with

HTML/CSS/JS · Sentinel-2 L2A · NDVI · Open-Meteo · NASA EONET · Solana devnet RPC · Phantom (optional) · globe.gl · D3 · TopoJSON

---

## Try it out

```bash
npx --yes serve dist
```

Then open [http://localhost:3000/?demo=1](http://localhost:3000/?demo=1)

Happy path: **Explore the demo → Demak → Run evidence check → 2017 / 2021 / NDVI → Run evidence agents**.

Pitch beats: [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

---

## Six slides if the laptop dies

1. Receipt vs evidence  
2. Four questions: what changed / how measured / who verified / what happened to the money  
3. Demak studio (real Sentinel pair)  
4. Reef/solar refusal  
5. Real vs simulated (table above)  
6. Next: vault + reviewer; today you watched the gate  

---

## Suggested Devpost answers to “is this AI?”

**Yes, as an agent system with a human gate — not as a model that “verifies impact.”** Six specialists inspect quality, boundary, change, anomalies, language, and the release rule. They emit a recommendation and a hash. A person still has to sign. Money does not move on a confidence percentage.
