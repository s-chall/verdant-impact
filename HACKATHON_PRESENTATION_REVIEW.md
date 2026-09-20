# Verdant — Hackathon Presentation Review

**Audience:** the team, before they walk on stage  
**Lens:** 2–3 minute demo + story + judges, not a production refactor  
**Repo surveyed:** `https://github.com/s-chall/verdant-impact` @ `9725ded` (2026-09-19)  
**What exists:** `dist/index.html` (single-page app), four Sentinel-2 PNGs, `PROJECT_SPEC.md`, `.openai/hosting.json`  
**What does not exist:** README, live URL, pitch deck, screenshots/video, tests, source split, domain, GitHub description

This is an analysis-only review. Do not treat the Phase 1–4 MVP list in the spec as pre-demo homework.

---

## 1. What this product is, and who it is for

Verdant is a **proof-of-impact funding platform for environmental philanthropy**. A donor funds a *measurable milestone*, watches environmental observations arrive, and sees whether independent evidence supports the claim. Money stays locked until the evidence gate passes — or is visibly refused.

The one-line pitch already in `PROJECT_SPEC.md` is the right one:

> Fund environmental change, then watch the evidence prove—or refuse to prove—that it happened.

**Primary persona in the current UI:** an individual donor / philanthropist who wants to *see* what happened after they gave.

**Secondary personas in the spec, not yet on stage:** project operator, human reviewer, institutional funder.

**Not:** a donation directory, an ESG score, a blockchain explorer, or a generic “impact dashboard.” The defining loop is:

discover → fund a milestone vault → collect evidence → run visible agents → verify / refuse / request more → human signs → record on Solana → show the donor what changed *and* what is still uncertain.

**Sponsor tracks implied by the spec:**

| Track | What judges will look for | Current strength |
| --- | --- | --- |
| OPEF / environmental intelligence | Real observations, provenance, agents that refuse | **Strongest live demo** |
| Bloomberg / philanthropic outcomes | Plain language, honest attribution, milestone clarity | Half-built; copy often contradicts it |
| Solana / verifiable funding | Wallet, vault, hash, release/refund | **Weakest live demo** (finality ping + fake “Confirm with Solana”) |
| GoDaddy / identity | Memorable domain that opens the product | Not started |

**Recommendation:** present Verdant as an *evidence product that happens to record decisions on Solana*, not as a Solana wallet app with a globe. Lead with Demak + refusal. Mention Solana as the ledger of *decisions*, not of truth.

---

## 2. Current inventory (what a judge actually sees)

### Repository / first impression

| Item | Status | Judge effect |
| --- | --- | --- |
| GitHub About / description | Empty | Looks unfinished or private |
| Homepage / website field | Empty | No one-click demo |
| Topics | None | Invisible in search |
| README | **Missing** | Judges cannot reproduce or understand the story from the repo |
| Issues / PRs / license | None | Fine for a hackathon; not a gap |
| Pitch deck / one-pager / video | Missing | No backup if live Wi-Fi dies |
| Screenshots in repo | Missing | GitHub page is a file list |
| Tests / CI | None | Irrelevant to this presentation unless a “build quality” prize exists |
| Deploy config | `.openai/hosting.json` → static `dist/` | Hostable, but **no public URL is recorded** |

### Application

A polished single-file SPA:

- Login gate (Phantom signed-message **or** “Explore the demo”)
- Portfolio (globe + “impact pulse” + then/now cards + 3 projects)
- Discover (second globe + non-working category chips)
- Evidence Monitor (Open-Meteo, NASA EONET, Solana devnet finality)
- Impact Ledger (static timeline)
- Project drawer → Evidence Studio + fund modal

External live calls that were reachable from this review environment:

- `api.open-meteo.com` — 200 (Demak weather)
- `eonet.gsfc.nasa.gov` — 200 (open events)
- `api.devnet.solana.com` `getLatestBlockhash` — 200

CDN runtime: `globe.gl`, `topojson-client`, `d3`, Google Fonts, Unsplash, world-atlas. Demo dies if those CDNs or the live APIs fail and there is no offline fallback.

### Data

- **Demak:** real Sentinel-2 true-color + NDVI for 2017-08-27 and 2021-07-27, with cloud-cover metadata. This is the only scientifically grounded project.
- **Reef / solar:** Unsplash stock + an “evidence recipe” that correctly refuses.
- **News:** curated, sourced links (Wetlands International, RRAP, DOE). Good.
- **Globe pin for Demak:** `lat: -3.4, lng: 39.9` — that is the **Kenya coast**, not Demak, Central Java (`~-6.89, 110.64`). The Discover banner still says “Follow East Africa.” This is a live demo landmine.

---

## 3. Hackathon scorecard

| Criterion | Score | Why |
| --- | --- | --- |
| Clear problem | **A-** | Spec is excellent. The running app still talks like a feel-good portfolio. |
| Wow demo in 2–3 min | **B-** | Evidence Studio *can* be the wow — if you skip the decorative portfolio and do not get lost in dead controls. |
| Visual polish | **A-** | Dark forest palette, type, globe, studio chrome. Then/now cards cheat with CSS filters. |
| Working happy path | **C+** | Login → Demak → studio → agents works. Funding is a toast. Filters, follow, save, ledger, and Solana confirm are props. |
| Memorable differentiation | **A (idea) / C+ (stage)** | “Refusal is a feature” is rare and judge-sticky. Homepage currently *hides* it behind “Change verified this month.” |
| Easy judge reproduction | **F** | No README, no URL, no video, empty GitHub About. |
| Story / impact | **B** | Real Demak + Wetlands International is a true story. Attribution copy (“because of you”, “you helped three places heal”) undercuts the honesty thesis. |

**North-star test from the spec:** *“I can see what this project promised, what independent evidence observed, why the claim passed or failed, who reviewed it, and what happened to my funding.”*

A judge who only clicks the portfolio **cannot** answer that sentence. A judge who is walked through Evidence Studio on Demak, then Reef, **almost can** — except “who reviewed it” and “what happened to my funding” are still narration, not UI.

---

## 4. What is already strong — do not rebuild these

Protect this time. These are already better than most hackathon projects.

1. **The thesis.** Proof before promises, refusal as a feature, blockchain records *decisions not truth*. That is a memorable category, not a feature list. Keep `PROJECT_SPEC.md` §1–3 as the spoken story.
2. **A written demo sequence.** Spec §16 is already a 2–3 minute spine. Do not invent a new one; *stage* it.
3. **Evidence Studio.** Sequential agents, scan overlay, 2017/2021/NDVI toggles, honest “human review required” stop, and a correct refuse path for reef/solar. This is the product.
4. **Real Sentinel-2 pair for Demak.** Packaged imagery is fine for a demo. The dates, cloud %, L2A, and reconstructed-boundary disclaimer are trust-building. Do not replace them with prettier stock photos.
5. **Live environmental intelligence that labels itself as not-proof.** Monitor copy (“observations—not proof”) and Open-Meteo / EONET / Solana finality actually load.
6. **Demo login.** Judges without Phantom can enter. Keep this as the default path.
7. **Visual identity.** Lime-on-forest, Manrope headlines, globe atmosphere. It already looks like a product, not a Bootstrap template.
8. **Sourced project intelligence.** Real publisher names and outbound links in the drawer.
9. **Honest spec limitations.** §12 already admits: embedded config, packaged scenes, simulated agents, no vaults, no server-verified auth. Use that as the “what’s next” slide — do not try to finish Phase 1 before presenting.
10. **Responsive CSS.** If someone judges on a laptop or tablet, the layout is already considered.

**Do not spend pre-demo time on:** splitting the HTML into a framework, a database, automated STAC ingestion, a reviewer backend, three more coastal projects, tests, or a full institutional portfolio.

---

## 5. Prioritized recommendations

Effort key: **S** = hours / same evening · **M** = a focused day · **L** = multi-day / do not start before the pitch.

### Must-do before presenting

These are the items that decide whether judges *get it* and can replay it.

#### M1. Make the repo judge-reproducible

- **Why:** The GitHub page is currently an untitled file dump. Remote judges, async reviewers, and anyone who bookmarks the repo after the pitch will bounce. Reproduction is a scoring category at most hackathons even when the live demo goes well.
- **What:** Add a short `README.md` (one screen, not a novel):
  - One-line pitch + 3-bullet problem
  - **Live demo URL** (set GitHub About + website to the same URL)
  - “Open the app → **Explore the demo** → Demak → Run evidence check”
  - 90-second script (see M5)
  - What is real vs simulated (Sentinel pair real; agents choreographed; Solana vaults not deployed)
  - `npx serve dist` (or equivalent) for local
  - Team + tracks (OPEF / Solana / Bloomberg)
  - Fill GitHub description: `Proof-of-impact funding: donate, then watch evidence prove or refuse the claim.`
- **Files:** new `README.md`; GitHub About fields; optional 3 screenshots under `docs/`
- **Effort:** S

#### M2. Align the first 10 seconds of UI with the truth model

- **Why:** Judges believe the first headline. Today the first logged-in screen says the opposite of the product: “You helped three places heal,” “Change verified this month,” “72 thriving,” “2 milestones verified,” “✓ Satellite verified.” Then Evidence Studio carefully *withholds* verification. That looks like a mock that does not know its own definition of truth.
- **What:** Rewrite portfolio + ledger + drawer chrome to the controlled vocabulary in spec §8:
  - Demak: **Human review** (not “verified”)
  - Reef / solar: **More evidence needed**
  - Replace “72 thriving” with milestone states (e.g. 1 in review · 2 held)
  - Drawer proof tiles: do not claim “Field confirmed” / “Onchain trail” unless that project has them
  - Fund modal: drop “flourish because of you”; use proportional language from spec §6.5
  - Login H1 can stay warm, but the subtitle should mention *prove or refuse*
- **Files:** `dist/index.html` (hero, meter, change-cards, project-foot signals, ledger events, drawer `.proof-row`, fund modal)
- **Effort:** S

#### M3. Fix the geography lie before anyone spins the globe

- **Why:** The wow object on stage is the globe. Demak is pinned on Kenya; Discover still says “Follow East Africa.” A single judge who knows Indonesia — or who simply clicks the African pulse and reads “Indonesia” — will discount the rest of the evidence story.
- **What:**
  - Move mangrove pin to Demak (`-6.89, 110.64`). Reef and solar pins are close enough.
  - Default globe POV toward Java, not East Africa.
  - Replace “Follow East Africa” with a real region from the three projects, or remove the banner.
  - Confirm the Monitor map project dots move with the new coordinates.
- **Files:** `dist/index.html` (`projectPoints`, `buildGlobe` start POV, `#followRegion`)
- **Effort:** S

#### M4. Make the Demak then/now *actually* then/now — and annotate the change

- **Why:** The home “Then → Now” mangrove card uses **the same 2021 PNG twice**, with a desaturate filter on “Then.” Judges who later see the real 2017/2021 pair in the studio will notice. Separately, the real 2017 vs 2021 frames are scientifically honest but **visually subtle** (same shoreline, similar NDVI). Without a crop, mask, or callout, the studio looks like “two similar satellite photos + a progress bar.”
- **What (presentation-scale, not a new model):**
  - Point the home then/now at `demak-2017.png` / `demak-2021.png`.
  - In the studio, add a simple change callout: e.g. a highlighted coastal segment, “baseline 27 Aug 2017 → current 27 Jul 2021,” and one plain sentence of *what is measured* (vegetation index / shoreline), not “mangroves took root.”
  - After agents finish, show the **funding consequence** next to the recommendation: `Human review · vault remains locked`. That single chip is the product.
- **Files:** `dist/index.html` (`.mangrove-change`, `#evidenceResult`, optional SVG overlay on `#satStage`)
- **Effort:** S–M

#### M5. Script, shortcut, and record the 150-second path

- **Why:** Spec §16 is 11 beats. Unscripted clicking through login, globe, dead Discover filters, and the fake fund modal will burn the slot. Wi-Fi + CDN + NASA can still fail on stage.
- **What:**
  - Treat this as the **only** live path (times are speaking time, not load time):

    | t | Action | Line |
    | --- | --- | --- |
    | 0:00 | Login → **Explore the demo** (do not wait for Phantom) | “Environmental giving ends in a receipt. Verdant ends in evidence.” |
    | 0:15 | Open Demak drawer. Point at *Measured signal* + *Decision gate* | “Donors fund a milestone, not a vibe.” |
    | 0:35 | Evidence Studio. Flip 2017 → 2021 → NDVI | “These are real Sentinel-2 passes. Pretty is not proof.” |
    | 1:05 | Run evidence agents. Stop on human review | “The system can recommend. It cannot release.” |
    | 1:35 | Reef or solar → run agents → **refuse** | “Refusal is the feature. One photo cannot unlock funds.” |
    | 2:00 | Evidence Monitor live cards | “Weather and NASA events tell us *when* to look — they are not the proof.” |
    | 2:20 | Close | “Next we bind the signed evidence hash to a Solana milestone vault. Today you watched the gate.” |

  - Add a presenter query (`?demo=1`) that skips login, opens Demak studio, and pre-positions the globe. **S**
  - Record a 2-minute silent or voiced backup (phone is fine). Put the link in the README. **S**
  - One presenter drives; one watches network tab / has the video ready.
- **Files:** `README.md` (script); `dist/index.html` (query-param bootstrap); video hosted outside git
- **Effort:** S

#### M6. Stop claiming a Solana payment you do not send

- **Why:** “Confirm with Solana” currently closes a modal and shows “Added to your living portfolio.” That is the fastest way to lose a Solana-track judge *and* a trust-track judge in the same click. Curiosity clicks happen during Q&A.
- **What (pick one, do not do both):**
  - **A (safest, S):** Rename the button to `Preview contribution (demo)` and show a **locked vault** state: amount, milestone, “release awaits human review,” no explorer link pretended.
  - **B (if you need the Solana bounty, M):** One real devnet memo or USDC transfer + explorer link, labeled as “contribution recorded; release not implemented.” A memo hash of the evidence manifest is more on-thesis than a fake vault.
- **Files:** `dist/index.html` (`.confirm` handler, toast, ledger row)
- **Effort:** S (A) / M (B)

---

### High impact (do if M1–M6 are done and you still have a day)

#### H1. Lead the UI with the evidence gate, not the decorative meter

- **Why:** Spec §15: “Put proof, current evidence state, and funding consequence before decorative portfolio statistics.” The 72-ring and bar chart consume the first glance and say nothing.
- **What:** Replace the ring with a 3-row milestone strip: Demak / Reef / Solar × state × money consequence. Keep the globe; lose the fake score.
- **Files:** `dist/index.html` (`.meter-card`, `.story-card`)
- **Effort:** S

#### H2. Connect Monitor events to the three projects — or shrink the map

- **Why:** EONET will happily show a Texas wildfire while you are talking about Java mangroves. Judges will ask “so what?” Live data that is *unrelated* feels like an API sticker.
- **What:** Prefer project-local observations (you already have Open-Meteo per site). If you keep EONET, filter/highlight events near the three pins and label them `Observed · not in project boundary`. Hide the world map if time is short; the three intel cards are the better demo.
- **Files:** `dist/index.html` (`loadEarthSignals`, `.active-intel`)
- **Effort:** S–M

#### H3. Make Discover filters either work or disappear

- **Why:** Dead chips are a classic “this is a mock” tell. Someone will tap Forests during Q&A.
- **What:** Filter `mini-project` + globe points by category, or remove the chips.
- **Files:** `dist/index.html` (`.filter` click handler)
- **Effort:** S

#### H4. A 6-slide spoken deck (not a product tour)

- **Why:** If the laptop fails, you still have a story. If it works, the deck is only the close.
- **What:** (1) Receipt vs evidence, (2) four questions from spec §1, (3) Demak studio screenshot, (4) refusal screenshot, (5) honest architecture — what is real vs simulated, (6) ask / next: vault + reviewer. No architecture spaghetti. No 14-feature roadmap.
- **Files:** `docs/pitch.pdf` or Google Slides; thumbnail in README
- **Effort:** S

#### H5. One memorable “refusal” visual, equal in quality to success

- **Why:** Spec §6.4 is the differentiator. Reef/solar studio currently reuses a stock photo and a text result. The *feeling* of a held gate should look as designed as the Demak scan.
- **What:** A missing-evidence panel: Available / Missing / Why insufficient / What would unblock / Vault state = locked. Same chrome as the Demak result card.
- **Files:** `dist/index.html` (`prepareEvidence` refuse branch, `#evidenceResult`)
- **Effort:** S

#### H6. Preload / cache the wow path so the room network cannot kill you

- **Why:** Globe textures, fonts, Unsplash, and three live APIs are single points of failure. The Demak PNGs are already local (~5.5 MB) — good.
- **What:** Prefetch `demak-*.png` on login. Host globe earth texture locally or bundle a snapshot. Keep a screenshot of a populated Monitor as a flip-to backup. Test once on venue Wi-Fi or a phone hotspot.
- **Files:** `dist/assets/`, tiny preload in `dist/index.html`
- **Effort:** S

#### H7. Pick a domain only if the GoDaddy track is scored

- **Why:** Spec §10 says the domain should open the *product*, not a marketing page. A `verdant.app`-style URL is easier to say than a ChatGPT/OpenAI host URL. Note: `verdantimpact.org` and `verdant-impact.com` are already unrelated companies — do not collide.
- **What:** Short name → DNS → same `dist/` static host. Update README + GitHub website.
- **Files:** DNS / host; README
- **Effort:** S (registration) / M (if DNS fights you)

---

### Nice-to-have (after the pitch is safe)

Do these only if the must-dos are green. None of them save a broken 3-minute demo.

| ID | Item | Why it helps | Where | Effort |
| --- | --- | --- | --- | --- |
| N1 | Reviewer “sign decision” overlay (local, no backend) | Completes the north-star sentence “who reviewed it” | New panel in studio; append a ledger row | M |
| N2 | Show a fake-but-honest evidence manifest + SHA | Makes “hash on Solana” tangible without a program | JSON drawer under `#evidenceResult` | S |
| N3 | Replace hardcoded “Friday” with today’s date | Cheap credibility | `.topbar .eyebrow` | S |
| N4 | Persist demo session + last project in the URL | Judges can be sent a deep link | `?project=mangrove&studio=1` | S |
| N5 | Working save / follow — or remove | Dead hearts and Follow are tells | `.project-save`, `#followRegion` | S |
| N6 | Ledger that updates after fund-preview or refuse | Closes the loop visually | `#activity` timeline | S |
| N7 | Reef/solar: one real observation each (SST chart, irradiance) instead of Unsplash-as-satellite | Stops the “stock photo as evidence” comparison with Demak | `projects.reef/solar` + studio stage | M |
| N8 | Very light smoke test: “demo login, open Demak, run agents, result visible” | Protects the happy path from last-minute CSS breakage | `tests/demo.spec.ts` or a 20-line Playwright | M |
| N9 | Split CSS/JS out of `index.html` | Only if two people must edit at once | `dist/app.css`, `dist/app.js` | M |
| N10 | Real milestone vault / Phantom USDC | Impressive, but Q&A will then ask about audits, refunds, custody | new program + UI | **L — after the hackathon** |
| N11 | Automated Sentinel search, GeoJSON onboarding, reviewer console backend | Spec Phase 1. Correct product, wrong pre-demo work | new services | **L — do not start** |

---

## 6. Suggested spoken story (keep this, cut everything else)

**Problem (20s).** Giving to a mangrove project today buys a receipt and, months later, a PDF. Satellites, weather, and field surveys already exist. They are not attached to the money.

**Product (20s).** Verdant puts funding behind an evidence gate. A milestone names the boundary, the signal, the second source, and what happens if the claim fails.

**Demo (90s).** Demak, real Sentinel pair, agents, *hold for review*. Reef, *refuse*. Monitor, *live but not proof*.

**Honest close (20s).** Agents are a visible simulation on packaged scenes. Vaults are next. What you saw is the product decision: **the system is allowed to say no.**

**Do not say:** “AI verifies impact,” “you restored this coastline,” “it’s on-chain so it’s true,” “72 thriving,” or “we’ll also do solar, reefs, forests, and institutions.”

---

## 7. Day-of checklist

- [ ] Live URL opens on a *phone that is not yours*
- [ ] “Explore the demo” works with cookies cleared (no leftover Phantom state)
- [ ] Demak pin is on Java
- [ ] 2017 / 2021 / NDVI all render (no broken local paths)
- [ ] Agent run reaches the human-review card in <6s
- [ ] Reef or solar refuse path shown once in rehearsal
- [ ] Monitor intel cards populate, or you skip that beat and use the backup video
- [ ] Nobody clicks “Confirm with Solana” unless it does something honest
- [ ] Backup video queued, HDMI + browser zoom 110–125%, notifications off
- [ ] One printed or notes-app version of the 150-second script

---

## 8. Bottom line

Verdant already has what most hackathon teams lack: a sharp problem, a distinctive moral (refusal), a cinematic core screen, and one real satellite case. It will lose if judges meet the *portfolio mock* first — empty GitHub, Kenya-labeled Indonesia, “verified” headlines, and a Solana button that toasts.

**Spend the remaining time on reproduction, copy-truth, geography, the Demak/refuse climax, and a rehearsed 150-second path.** Leave the platform MVP in the spec until after you have a prize or a yes.
