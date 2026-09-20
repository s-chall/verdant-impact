# Verdant

**USDC for a named nonprofit. Sentinel-2 is the oracle. If the land did not move, the money does not.**

Verdant is programmable philanthropy: a board of environmental grantees, each with a **Solana milestone vault**, and an **Earth Oracle** that reads real Sentinel-2 scenes. Preview USDC into the org (demo — nothing is sent). A check can refuse to pay.

This is not a donate button, not a carbon NFT, and not a toy globe. The product is: **who gets the money**, **what the satellite saw**, and **whether the vault may unlock**.

## Open the demo

```bash
npx --yes serve dist
```

Then open **http://localhost:3000/**

- [http://localhost:3000/](http://localhost:3000/) — nonprofit treasuries + thesis
- [http://localhost:3000/?demo=1](http://localhost:3000/?demo=1) — Building with Nature / Demak
- [http://localhost:3000/?project=mangrove&studio=1](http://localhost:3000/?project=mangrove&studio=1)
- [http://localhost:3000/?project=demak&check=1](http://localhost:3000/?project=demak&check=1) — opens Demak and runs the oracle

**Judge path:** read who gets paid → open a nonprofit → drag 2018/2026 satellite proof → **Preview USDC** → **Run Earth Oracle** → vault stays locked (or would refuse).

```bash
npm test
python3 scripts/test_classify.py
```

## Refresh the satellite archive

```bash
python3 scripts/aggregate_projects.py
python3 scripts/test_classify.py
```

The aggregator queries Element84 Earth Search for low-cloud Sentinel-2 L2A thumbnails (2018, 2020, 2022, 2024, 2026), stores JPEGs under `dist/assets/sat/`, and writes `dist/data/projects.json`.

## What is real vs derived

| Real | Derived / simplified |
| --- | --- |
| Named operators / nonprofits and site coordinates | Milestone *targets* are product rules, not legal MRV |
| Sentinel-2 L2A scenes + cloud % from STAC | Index is a preview-image green/water/brightness score, not a full NDVI pipeline |
| Live Open-Meteo at the clicked site | Weather is context, not proof |
| Automatic oracle + local SHA-256 of the evidence pack | Hash is not written on-chain; vaults are not deployed |
| Optional local reviewer signature | No backend; does not release funds |

## Docs

- [Product specification](PROJECT_SPEC.md)
- [Devpost write-up](DEVPOST.md)
- [150-second demo script](DEMO_SCRIPT.md)
