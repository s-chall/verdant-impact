#!/usr/bin/env python3
"""Pull low-cloud Sentinel-2 thumbnails from Earth Search STAC and score a simple index.

Writes dist/data/projects.json and dist/assets/sat/{id}/{year}.jpg.
Existing JPEGs are reused so re-runs only fetch missing years.
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "data" / "projects.seed.json"
OUT_JSON = ROOT / "dist" / "data" / "projects.json"
ASSET_DIR = ROOT / "dist" / "assets" / "sat"
STAC = "https://earth-search.aws.element84.com/v1/search"
YEARS = (2018, 2020, 2022, 2024, 2026)
EXPECTED = len(YEARS)


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


def bbox_for(lat: float, lng: float, span: float = 0.16) -> list[float]:
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
    for cloud_max in (25, 40):
        payload = {
            "collections": ["sentinel-2-l2a"],
            "bbox": bbox_for(lat, lng),
            "datetime": f"{year}-01-01T00:00:00Z/{year}-12-31T23:59:59Z",
            "limit": 12,
            "query": {"eo:cloud_cover": {"lt": cloud_max}},
            "sortby": [{"field": "properties.eo:cloud_cover", "direction": "asc"}],
        }
        try:
            data = fetch_json(payload)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as err:
            print(f"  STAC fail {year} cloud<{cloud_max}: {err}", file=sys.stderr)
            continue
        features = data.get("features") or []
        if not features:
            continue
        feat = features[0]
        thumb = (feat.get("assets") or {}).get("thumbnail", {}).get("href")
        if not thumb:
            continue
        return {
            "id": feat.get("id"),
            "date": (feat.get("properties") or {}).get("datetime", "")[:10],
            "cloud": round(float((feat.get("properties") or {}).get("eo:cloud_cover") or 0), 2),
            "thumb": thumb,
        }
    return None


def classify(direction: str, scenes: list[dict], target: float, intent: str = "restore") -> dict:
    series = [s["index"] for s in scenes]
    baseline, current = series[0], series[-1]
    delta = current - baseline
    if direction == "down":
        signed = -delta
    elif direction == "either":
        signed = abs(delta)
    else:
        signed = delta
    denom = max(abs(baseline), 0.08)
    rel = signed / denom * 100
    recent = series[-1] - series[-2]
    if direction == "down":
        recent = -recent

    if intent == "hold":
        loss = max(0.0, -rel)
        progress = round(max(0.0, min(100.0, 100.0 - loss / max(target, 1.0) * 100)), 1)
        if loss > target:
            status, trend = "Off track", "declining"
        elif recent < -0.006 and signed > 0:
            status, trend = "Shifting", "reversing"
        elif loss < target * 0.35:
            status, trend = "On track", "stable" if abs(delta) < 0.01 else "advancing"
        else:
            status, trend = "Watching", "declining"
    else:
        progress = round(max(0.0, min(100.0, (rel / target * 100) if target else 0.0)), 1)
        if direction != "either" and signed < -0.01:
            status, trend = "Off track", "declining"
        elif abs(delta) < 0.008:
            status, trend = "Watching", "flat"
        elif direction != "either" and recent < -0.006 and signed > 0:
            status, trend = "Shifting", "reversing"
        elif progress >= 40:
            status, trend = "On track", "advancing"
        else:
            status, trend = "Watching", "advancing"

    return {
        "progress": progress,
        "baseline": round(baseline, 4),
        "current": round(current, 4),
        "delta": round(delta, 4),
        "relPct": round(rel if intent != "hold" else (signed / denom * 100), 1),
        "status": status,
        "trend": trend,
        "intent": intent,
    }


def milestones(seed: dict, scenes: list[dict], stats: dict) -> list[dict]:
    cadence = round(min(100.0, len(scenes) / EXPECTED * 100), 1)
    halfway = round(min(100.0, stats["progress"] / 0.5), 1)
    goal = stats["progress"]
    sign = "+" if stats["delta"] >= 0 else ""
    return [
        {
            "name": "Baseline mapped",
            "detail": f"First clear Sentinel-2 scene · {scenes[0]['date']}",
            "pct": 100,
            "state": "done",
        },
        {
            "name": "Monitoring cadence",
            "detail": f"{len(scenes)} of {EXPECTED} target years in the archive",
            "pct": cadence,
            "state": "done" if cadence >= 80 else "active",
        },
        {
            "name": "Halfway to goal",
            "detail": "Measured change has reached half the stated target",
            "pct": halfway,
            "state": "done" if stats["progress"] >= 50 else "active" if stats["progress"] > 8 else "wait",
        },
        {
            "name": "Stated goal",
            "detail": f"{stats['status']} · {seed['signal']} Δ {sign}{stats['delta']:.3f} ({stats['relPct']:+.1f}% vs 2018)",
            "pct": goal,
            "state": "done" if goal >= 100 else "active" if goal > 20 else "wait",
        },
    ]


def load_catalog_meta() -> dict[tuple[str, int], dict]:
    if not OUT_JSON.exists():
        return {}
    try:
        data = json.loads(OUT_JSON.read_text())
    except json.JSONDecodeError:
        return {}
    meta: dict[tuple[str, int], dict] = {}
    for project in data.get("projects") or []:
        for scene in project.get("scenes") or []:
            meta[(project["id"], int(scene["year"]))] = {
                "date": scene.get("date"),
                "cloud": scene.get("cloud", 0),
                "stacId": scene.get("stacId", ""),
            }
    return meta


CATALOG = load_catalog_meta()


def collect_year(seed: dict, year: int) -> dict | None:
    dest = ASSET_DIR / seed["id"]
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / f"{year}.jpg"
    meta_path = dest / f"{year}.json"
    if path.exists() and path.stat().st_size > 2000:
        raw = path.read_bytes()
        meta = dict(CATALOG.get((seed["id"], year)) or {})
        if meta_path.exists():
            try:
                meta.update(json.loads(meta_path.read_text()))
            except json.JSONDecodeError:
                pass
        index = round(score_image(raw, seed["signal"]), 4)
        return {
            "year": year,
            "date": meta.get("date") or f"{year}-06-01",
            "cloud": meta.get("cloud", 0),
            "stacId": meta.get("stacId", ""),
            "image": f"assets/sat/{seed['id']}/{year}.jpg",
            "index": index,
            "source": "Sentinel-2 L2A · Earth Search STAC",
        }
    scene = best_scene(seed["lat"], seed["lng"], year)
    if not scene:
        print(f"  no scene {seed['id']} {year}")
        return None
    try:
        raw = fetch_bytes(scene["thumb"])
        path.write_bytes(raw)
        meta_path.write_text(
            json.dumps({"date": scene["date"], "cloud": scene["cloud"], "stacId": scene["id"]})
        )
        index = round(score_image(raw, seed["signal"]), 4)
    except Exception as err:  # noqa: BLE001
        print(f"  download fail {seed['id']} {year}: {err}", file=sys.stderr)
        return None
    print(f"  {seed['id']} {year} {scene['date']} cloud={scene['cloud']} index={index}")
    return {
        "year": year,
        "date": scene["date"],
        "cloud": scene["cloud"],
        "stacId": scene["id"],
        "image": f"assets/sat/{seed['id']}/{year}.jpg",
        "index": index,
        "source": "Sentinel-2 L2A · Earth Search STAC",
    }


def drop_outliers(scenes: list[dict]) -> list[dict]:
    if len(scenes) < 3:
        return scenes
    vals = sorted(s["index"] for s in scenes)
    med = vals[len(vals) // 2]
    span = max(0.22, abs(med) * 0.5)
    kept = [s for s in scenes if abs(s["index"] - med) <= span]
    return kept if len(kept) >= 2 else scenes


def build_project(seed: dict) -> dict | None:
    scenes = []
    for year in YEARS:
        scene = collect_year(seed, year)
        if scene:
            scenes.append(scene)
        time.sleep(0.05)
    scenes = drop_outliers(scenes)
    if len(scenes) < 2:
        print(f"  SKIP {seed['id']} (need 2 scenes, got {len(scenes)})")
        return None
    stats = classify(
        seed.get("direction", "up"),
        scenes,
        seed["target"],
        seed.get("intent", "restore"),
    )
    return {
        **seed,
        **stats,
        "scenes": scenes,
        "series": [{"year": s["year"], "index": s["index"], "cloud": s["cloud"]} for s in scenes],
        "milestones": milestones(seed, scenes, stats),
    }


def main() -> None:
    seeds = json.loads(SEED.read_text())
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    projects: list[dict] = []
    workers = 4
    print(f"aggregating {len(seeds)} sites × {len(YEARS)} years with {workers} workers")
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futs = {pool.submit(build_project, seed): seed["id"] for seed in seeds}
        for fut in as_completed(futs):
            pid = futs[fut]
            try:
                project = fut.result()
            except Exception as err:  # noqa: BLE001
                print(f"FAIL {pid}: {err}", file=sys.stderr)
                continue
            if project:
                projects.append(project)
                print(f"OK {pid} {project['status']} {project['progress']}% ({len(project['scenes'])} scenes)")
    order = {s["id"]: i for i, s in enumerate(seeds)}
    projects.sort(key=lambda p: order.get(p["id"], 999))
    payload = {
        "generated": True,
        "source": STAC,
        "years": list(YEARS),
        "count": len(projects),
        "scenes": sum(len(p["scenes"]) for p in projects),
        "projects": projects,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2))
    print(f"wrote {len(projects)} projects / {payload['scenes']} scenes → {OUT_JSON}")


if __name__ == "__main__":
    main()
