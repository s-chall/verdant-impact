# Verdant

**Fund a nonprofit milestone. Watch satellites prove it. USDC stays locked on Solana until the evidence checks out.**

Verdant is a no-login **cartoon globe** of coastal, forest, reef, and energy sites. Preview USDC into a **milestone vault** (demo — nothing is sent). Each site has a **Sentinel-2 timeline**. A check can refuse to unlock funds.

The playground uses a Duolingo-style toy Earth (hex land, candy pins) plus [Anthropic’s frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design): one signature object (the globe), pressable 4px buttons, Nunito, and honest copy.

## Open the demo

```bash
npx --yes serve dist
```

- [http://localhost:3000/](http://localhost:3000/) — list + globe of 50 packaged sites
- [http://localhost:3000/?demo=1](http://localhost:3000/?demo=1) — opens Demak
- [http://localhost:3000/?project=mangrove&studio=1](http://localhost:3000/?project=mangrove&studio=1) — same, as a deep link
- [http://localhost:3000/?project=noor](http://localhost:3000/?project=noor) — any project id
- [http://localhost:3000/?project=demak&check=1](http://localhost:3000/?project=demak&check=1) — opens Demak and runs the check

**Judge path:** spin the globe → open a nonprofit → **Preview USDC (demo)** → scrub years → **Run satellite check** → vault stays locked.

```bash
npm test
python3 scripts/test_classify.py
```

## Refresh the satellite archive

```bash
python3 scripts/aggregate_projects.py
python3 scripts/test_classify.py
```

The aggregator queries Element84 Earth Search for low-cloud Sentinel-2 L2A thumbnails (2018, 2020, 2022, 2024, 2026), stores JPEGs under `dist/assets/sat/`, and writes `dist/data/projects.json`. Existing JPEGs are reused.

## What is real vs derived

| Real | Derived / simplified |
| --- | --- |
| Site coordinates and operators | Milestone *targets* are product rules, not legal MRV |
| Sentinel-2 L2A scenes + cloud % from STAC | Index is a preview-image green/water/brightness score, not a full NDVI pipeline |
| Live Open-Meteo at the clicked site | Weather is context, not proof |
| Automatic check + local SHA-256 of the evidence manifest | Hash is not written on-chain; vaults are not deployed |
| Open-Meteo weather, marine SST (reefs), shortwave irradiance (energy) | Context, not proof |
| Optional local reviewer signature | No backend; does not release funds |

## Docs

- [Product specification](PROJECT_SPEC.md)
- [Devpost write-up](DEVPOST.md)
- [150-second demo script](DEMO_SCRIPT.md)
