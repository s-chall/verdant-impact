# Devpost copy — Verdant

Paste these blocks into Devpost. Keep the honesty: agents are a visible pipeline, not a trained remote-sensing model, and Solana vaults are not deployed yet.

---

## Tagline (≤60 characters)

See projects worldwide. Watch satellites measure the milestone.

**Backup:** Proof-of-impact, measured from Sentinel-2.

---

## Elevator pitch (2–3 sentences)

Environmental giving usually ends with a receipt. Verdant puts **ongoing sites worldwide** on one globe. Click a coast, forest, reef, or energy project: you get a real **Sentinel-2 timeline**, milestone progress, and an **automatic satellite check** — no login, no human-review queue. Agents read the pixels; the readout can come back on track, watching, shifting, or off track.

---

## Inspiration

Philanthropy can move money. Satellites can observe the planet. Those two systems almost never meet in a way a judge can *see*.

The wow is not a wallet. It is being able to scan many live projects, open one, watch years of imagery, and run a check that measures whether the milestone moved.

---

## What it does

Verdant is a **satellite-measured project map**.

1. Browse coasts, forests, reefs, and energy sites worldwide (list + globe).
2. Open a site. Goal in one sentence. Status is computed from the archive.
3. Scrub the **Sentinel-2 timeline** (2018 → 2026, low-cloud scenes from Earth Search STAC).
4. Read **milestone bars**: baseline mapped, monitoring cadence, halfway to goal, stated goal.
5. **Run satellite check** — scan animation, pixel grid, year-by-year index, automatic score.
6. Live Open-Meteo at that coordinate is labeled as observation, not proof.

No login. `/?demo=1` opens Demak. `/?project=noor` opens any site.

---

## How we built it / agentic architecture

### Design rule

Agents **score automatically** so a judge is not asked to be a reviewer. They do not mint legal MRV and they do not move money.

### Pipeline

```text
Seed sites (place, goal, signal)
        ↓
Earth Search STAC  →  Sentinel-2 L2A thumbnails (2018/2020/2022/2024/2026)
        ↓
Preview index (greenness / water / brightness)
        ↓
Status + milestone % (on track / watching / shifting / off track)
        ↓
Static publish: dist/data/projects.json + dist/assets/sat/
        ↓
Browser: globe + list + timeline + Run satellite check
```

Each check step is a **specialist with a stop condition**: load scenes, sample pixels, compute index, read trend, emit score. Later steps do not pretend to be a trained remote-sensing model.

### What is actually running today

| Layer | Implementation | Honest status |
| --- | --- | --- |
| UI | `dist/index.html` + `app.js` | Working demo |
| Archive | `scripts/aggregate_projects.py` → packaged JPEG + JSON | **Real STAC scenes** |
| Index | Preview-image green / water / brightness | **Simplified**, not full NDVI |
| Check animation | Sequential agents + canvas grid | Visible pipeline, not a trained model |
| Live intel | Open-Meteo at the clicked site | Observation, **not** impact proof |
| Funding | Not in this demo | **No USDC, no vault program** |

### Why this is “agentic” without faking AGI

- **Division of labor:** scenes vs pixels vs index vs trend vs score.
- **Tool-like inputs:** STAC metadata, packaged thumbnails, a stated target.
- **Visible control flow:** the donor watches the run.
- **No human queue** in the demo: the readout is automatic so judges are not asked to review.
- **Side-effect isolation:** agents cannot move money.

---

## Challenges we ran into

- **Pretty vs true.** A globe of only “thriving” sites would be a lie. The archive is allowed to come back off track.
- **Clicking a 3D Earth is a poor judge UX.** The list is the reliable path; the globe is the wow.
- **Preview JPEG is not NDVI.** We say so on first look, in the check result, and in the README.
- **Humans in the loop added work for judges.** The demo scores automatically. Custody and reviewer consoles stay in “what’s next.”

---

## Accomplishments we’re proud of

- A 150-second path: **many sites → one timeline → milestone bars → automatic check**.
- Real Sentinel-2 assets in the product, not stock-photo “satellites.”
- An aggregator that can be re-run to grow the archive.
- Live weather that **disclaims itself**.

---

## What we learned

Impact products die when they confuse a dashboard score with a claim. The durable idea is still a **gate**. This demo shows the measurement half of that gate at worldwide scale, without asking a judge to sign as a reviewer.

---

## What's next

1. Official GeoJSON boundaries and a real NDVI/COG pipeline.
2. Solana **devnet milestone vault**: USDC in, evidence-hash, release or refund.
3. A reviewer console — after the automatic score, not instead of it.
4. Domain-specific models per biome — no copy-paste of mangrove logic onto coral.

---

## Built with

HTML/CSS/JS · Python aggregator · Sentinel-2 L2A · Element84 Earth Search STAC · Open-Meteo · globe.gl · Pillow / NumPy

---

## Try it out

```bash
npx --yes serve dist
```

Then open [http://localhost:3000/?demo=1](http://localhost:3000/?demo=1)

Happy path: **list or globe → filter a biome → open a site → scrub years → Run satellite check**.

Pitch beats: [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

---

## Six slides if the laptop dies

1. Receipt vs evidence  
2. Many projects on one Earth  
3. Click → Sentinel timeline  
4. Milestone bars (how close)  
5. Automatic satellite check  
6. Next: vault + NDVI; today you watched the measurement  

---

## Suggested Devpost answers to “is this AI?”

**Yes, as an agent pipeline — not as a model that “verifies impact.”** Specialists load scenes, sample pixels, compute a simple index, read trend, and emit a score. The index is a preview-image proxy. Money does not move on that percentage.
