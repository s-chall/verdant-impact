# Verdant

**Fund environmental change, then watch the evidence prove—or refuse to prove—that it happened.**

Verdant is a proof-of-impact portfolio for environmental philanthropy. Donors fund a measurable milestone, inspect independent observations, and see whether the claim is held for human review or refused. Money does not release on a pretty picture.

## Open the demo

No hosted URL is recorded in this repo yet. Run it locally:

```bash
npx --yes serve dist
```

Then open:

- [http://localhost:3000/?demo=1](http://localhost:3000/?demo=1) — skips login, lands as Demo Explorer, opens Demak
- [http://localhost:3000/?demo=1&studio=1](http://localhost:3000/?demo=1&studio=1) — jumps straight into Evidence Studio
- or [http://localhost:3000/](http://localhost:3000/) → **Explore the demo**

**Happy path:** Explore the demo → Demak Coastal Recovery → **Run evidence check** → flip **2017 / 2021 / NDVI** → **Run evidence agents**.

Pitch timing: [DEMO_SCRIPT.md](DEMO_SCRIPT.md) · Devpost paste: [DEVPOST.md](DEVPOST.md)

## What is real vs simulated

| Real | Simulated / not built |
| --- | --- |
| Sentinel-2 true-color + NDVI for Demak (27 Aug 2017, 27 Jul 2021) | Evidence agents are a visible choreography, not model inference |
| Live Open-Meteo, NASA EONET, Solana **devnet finality** | Milestone vaults, USDC sends, and on-chain release are **not** deployed |
| Phantom *signed-message* login (optional) | Contribution CTA is a **preview only** — no transaction is sent |
| Curated, sourced project links | News is not auto-ingested; project config is embedded in the page |

## Docs

- [Product specification](PROJECT_SPEC.md)
- [Hackathon presentation review](HACKATHON_PRESENTATION_REVIEW.md)
- [150-second demo script](DEMO_SCRIPT.md)
- [Devpost write-up + agentic architecture](DEVPOST.md)
