#!/usr/bin/env python3
"""Pull low-cloud Sentinel-2 thumbnails from Earth Search STAC and score a simple index."""

from __future__ import annotations

import json
import math
import sys
import time
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "data" / "projects.seed.json"
OUT_JSON = ROOT / "dist" / "data" / "projects.json"
ASSET_DIR = ROOT / "dist" / "assets" / "sat"
STAC = "https://earth-search.aws.element84.com/v1/search"
YEARS = (2018, 2020, 2022, 2024)


def fetch_json(payload: dict, timeout: int = 45) -> dict:
    req = urllib.request.Request(
        STAC,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "User-Agent": "verdant-impact/1.0"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode())


def fetch_bytes(url: str, timeout: int = 45) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "verdant-impact/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def bbox_for(lat: float, lng: float, span: float = 0.18) -> list[float]:
    return [lng - span, lat - span, lng + span, lat + span]


def score_image(raw: bytes, signal: str) -> float:
    img = Image.open(BytesIO(raw)).convert("RGB").resize((128, 128))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    if signal == "greenness":
        return float(((g - r) / (g + r + 1e-6)).mean())
    if signal == "water":
        return float(((b - r) / (b + r + 1e-6)).mean())
    return float(((r + g + b) / 3).mean())


def best_scene(lat: float, lng: float, year: int) -> dict | None:
    payload = {
        "collections": ["sentinel-2-l2a"],
        "bbox": bbox_for(lat, lng),
        "datetime": f"{year}-01-01T00:00:00Z/{year}-12-31T23:59:59Z",
        "limit": 12,
        "query": {"eo:cloud_cover": {"lt": 25}},
        "sortby": [{"field": "properties.eo:cloud_cover", "direction": "asc"}],
    }
    try:
        data = fetch_json(payload)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as err:
        print(f"  STAC fail {year}: {err}", file=sys.stderr)
        return None
    features = data.get("features") or []
    if not features:
        return None
    feat = features[0]
    thumb = (feat.get("assets") or {}).get("thumbnail", {}).get("href")
    if not thumb:
        return None
    return {
        "id": feat.get("id"),
        "date": (feat.get("properties") or {}).get("datetime", "")[:10],
        "cloud": round(float((feat.get("properties") or {}).get("eo:cloud_cover") or 0), 2),
        "thumb": thumb,
    }


def progress_from(signal: str, baseline: float, current: float, target: float) -> float:
    delta = current - baseline
    if signal == "water":
        delta = abs(delta)
    scale = 0.07 if signal == "greenness" else 0.05 if signal == "water" else 0.12
    pct = (delta / scale) * 100
    pct = max(0.0, min(115.0, pct))
    return round(min(target * 1.15, pct) / target * 100 if target else pct, 1)


def milestones(progress: float, first_date: str, last_date: str) -> list[dict]:
    return [
        {
            "name": "Baseline mapped",
            "detail": f"First clear Sentinel-2 scene · {first_date}",
            "pct": 100,
            "state": "done",
        },
        {
            "name": "Mid-course change",
            "detail": "Halfway to the stated measurement target",
            "pct": min(100, round(progress / 0.5, 1)) if progress else 0,
            "state": "done" if progress >= 50 else "active" if progress > 8 else "wait",
        },
        {
            "name": "Milestone target",
            "detail": f"Latest scene · {last_date}",
            "pct": min(100, progress),
            "state": "done" if progress >= 100 else "active" if progress > 20 else "wait",
        },
    ]


def main() -> None:
    seeds = json.loads(SEED.read_text())
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    projects = []
    for seed in seeds:
        print(f"{seed['id']} …", flush=True)
        scenes = []
        for year in YEARS:
            scene = best_scene(seed["lat"], seed["lng"], year)
            if not scene:
                print(f"  no scene {year}")
                continue
            dest = ASSET_DIR / seed["id"]
            dest.mkdir(parents=True, exist_ok=True)
            path = dest / f"{year}.jpg"
            try:
                raw = fetch_bytes(scene["thumb"])
                path.write_bytes(raw)
                index = round(score_image(raw, seed["signal"]), 4)
            except Exception as err:  # noqa: BLE001
                print(f"  download fail {year}: {err}", file=sys.stderr)
                continue
            scenes.append(
                {
                    "year": year,
                    "date": scene["date"],
                    "cloud": scene["cloud"],
                    "stacId": scene["id"],
                    "image": f"assets/sat/{seed['id']}/{year}.jpg",
                    "index": index,
                    "source": "Sentinel-2 L2A · Earth Search STAC",
                }
            )
            print(f"  {year} {scene['date']} cloud={scene['cloud']} index={index}")
            time.sleep(0.15)
        if len(scenes) < 2:
            print(f"  SKIP (need 2 scenes, got {len(scenes)})")
            continue
        baseline, current = scenes[0]["index"], scenes[-1]["index"]
        progress = progress_from(seed["signal"], baseline, current, seed["target"])
        projects.append(
            {
                **seed,
                "progress": progress,
                "baseline": baseline,
                "current": current,
                "scenes": scenes,
                "milestones": milestones(progress, scenes[0]["date"], scenes[-1]["date"]),
            }
        )
    OUT_JSON.write_text(json.dumps({"generated": True, "source": STAC, "projects": projects}, indent=2))
    print(f"wrote {len(projects)} projects → {OUT_JSON}")


if __name__ == "__main__":
    main()
