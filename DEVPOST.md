# Devpost copy — Verdant

Paste these blocks into Devpost. Keep the honesty: agents are a visible pipeline, not a trained remote-sensing model, and Solana vaults are not deployed yet.

---

## Tagline (≤60 characters)

USDC for nonprofits. Sentinel-2 decides if it unlocks.

**Backup:** The planet signs for the grant.

---

## Elevator pitch (2–3 sentences)

Environmental giving usually ends with a receipt. Verdant puts **USDC with a named nonprofit** in a Solana milestone vault, then lets **Sentinel-2** decide whether the land moved. If a mangrove, forest, reef, or solar site is off track, the vault **refuses**. The demo is honest: the program is not deployed, nothing is sent, and the index is a preview-image score — but the STAC scenes, the grantee list, and the refuse logic are real.

---

## Inspiration

Philanthropy can move money. Satellites can observe the planet. Those two systems almost never meet in a way a judge can *see*.

Everyone else ships a donate button, a carbon NFT, or a map of pins. The wow is **who is getting the money**, **what the satellite saw**, and **a vault that can say no**.

---

## What it does

Verdant is **programmable philanthropy**.

1. A board of **nonprofits receiving USDC** — operator, site, locked vault, refuse/hold status.
2. Open a grantee. Goal in one sentence. Drag **2018 vs latest Sentinel-2** (Earth Search STAC).
3. Preview USDC into that org’s milestone vault (demo — not sent; program not deployed).
4. **Run Earth Oracle** — STAC id, cloud filter, pixel sample, index, milestone rule, vault instruction.
5. Off-track sites **would not be paid**. On-track sites still stay locked until a signed decision and a real program.
6. Live Open-Meteo at that coordinate is labeled as observation, not proof.

No login. `/?demo=1` opens Building with Nature / Demak.

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
Browser: grantee board + satellite cinema + Earth Oracle + vault preview
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
| Funding | Preview USDC to named org, vault UI, live devnet slot | **No send. Program not deployed.** |

### Why this is “agentic” without faking AGI

- **Division of labor:** scenes vs pixels vs index vs trend vs score.
- **Tool-like inputs:** STAC metadata, packaged thumbnails, a stated target.
- **Visible control flow:** the donor watches the run.
- **No human queue** in the demo: the readout is automatic so judges are not asked to review.
- **Side-effect isolation:** agents cannot move money.

---

## Challenges we ran into

- **Pretty vs true.** A board of only “thriving” sites would be a lie. Twenty vaults would refuse today.
- **A globe of pins hid the Solana story.** The product is who gets the money and whether the oracle pays.
- **Preview JPEG is not NDVI.** We say so on first look, in the check result, and in the README.
- **Humans in the loop added work for judges.** The demo scores automatically. Custody and reviewer consoles stay in “what’s next.”

---

## Accomplishments we’re proud of

- A 90-second path: **who gets paid → 2018/2026 satellite proof → preview USDC → Earth Oracle → vault refuses or holds**.
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

HTML/CSS/JS · Python aggregator · Sentinel-2 L2A · Element84 Earth Search STAC · Open-Meteo · Solana JSON-RPC (devnet slot) · Pillow / NumPy

---

## Try it out

```bash
npx --yes serve dist
```

Then open [http://localhost:3000/?demo=1](http://localhost:3000/?demo=1)

Happy path: **nonprofit board → open a grantee → drag satellite proof → Preview USDC → Run Earth Oracle**.

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
