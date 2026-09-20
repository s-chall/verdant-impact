# Verdant

**See environmental projects worldwide. Click one. Watch the satellite record. Run an automatic check.**

Verdant is a no-login globe of coastal, forest, reef, and energy sites. Each site is backed by a **Sentinel-2 timeline** pulled from the public Earth Search STAC catalog. A check compares the first and latest scene with a simple index — no wallet, no human-review queue for judges.

## Open the demo

```bash
npx --yes serve dist
```

- [http://localhost:3000/](http://localhost:3000/) — list + globe of 50 packaged sites
- [http://localhost:3000/?demo=1](http://localhost:3000/?demo=1) — opens Demak
- [http://localhost:3000/?project=noor](http://localhost:3000/?project=noor) — any project id

**Judge path:** scan the list or globe → filter Coasts / Forests / Reefs / Energy → open a site → scrub the year timeline → read milestone bars → **Run satellite check**.

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
| Automatic check (no human step) | No Solana vaults, no USDC, no reviewer backend |

## Docs

- [Product specification](PROJECT_SPEC.md)
- [Devpost write-up](DEVPOST.md)
- [150-second demo script](DEMO_SCRIPT.md)
