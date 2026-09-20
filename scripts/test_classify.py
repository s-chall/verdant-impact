#!/usr/bin/env python3
"""Unit checks for archive classification used by aggregate_projects.py."""

from aggregate_projects import classify, drop_outliers, milestones


def test_mangrove_gain_on_track():
    scenes = [
        {"year": 2018, "date": "2018-01-01", "index": 0.10},
        {"year": 2020, "date": "2020-01-01", "index": 0.13},
        {"year": 2022, "date": "2022-01-01", "index": 0.15},
        {"year": 2024, "date": "2024-01-01", "index": 0.16},
    ]
    stats = classify("up", scenes, 25)
    assert stats["status"] == "On track"
    assert stats["progress"] == 100.0
    assert stats["delta"] > 0


def test_loss_is_off_track():
    scenes = [
        {"year": 2018, "date": "2018-01-01", "index": 0.20},
        {"year": 2024, "date": "2024-01-01", "index": 0.12},
    ]
    stats = classify("up", scenes, 20)
    assert stats["status"] == "Off track"
    assert stats["progress"] == 0.0


def test_reef_glare_up_is_off_track():
    scenes = [
        {"year": 2018, "date": "2018-01-01", "index": 0.10},
        {"year": 2024, "date": "2024-01-01", "index": 0.18},
    ]
    stats = classify("down", scenes, 10)
    assert stats["status"] == "Off track"


def test_hold_stable_is_on_track():
    scenes = [
        {"year": 2018, "index": 0.20},
        {"year": 2024, "index": 0.198},
    ]
    stats = classify("up", scenes, 12, "hold")
    assert stats["status"] == "On track"
    assert stats["progress"] >= 90


def test_pv_darkening_counts():
    scenes = [
        {"year": 2018, "index": 0.80},
        {"year": 2024, "index": 0.50},
    ]
    stats = classify("either", scenes, 40)
    assert stats["status"] == "On track"
    assert stats["progress"] > 40


def test_milestones_have_four_gates():
    seed = {"signal": "greenness"}
    scenes = [
        {"year": 2018, "date": "2018-08-17", "index": 0.10},
        {"year": 2024, "date": "2024-07-16", "index": 0.14},
    ]
    stats = classify("up", scenes, 25)
    miles = milestones(seed, scenes, stats)
    assert [m["name"] for m in miles] == [
        "Baseline mapped",
        "Monitoring cadence",
        "Halfway to goal",
        "Stated goal",
    ]
    assert miles[0]["pct"] == 100


def test_drop_broken_year():
    scenes = [
        {"year": 2018, "index": 0.88},
        {"year": 2020, "index": 0.87},
        {"year": 2022, "index": 0.89},
        {"year": 2026, "index": 0.11},
    ]
    kept = drop_outliers(scenes)
    assert [s["year"] for s in kept] == [2018, 2020, 2022]


if __name__ == "__main__":
    test_mangrove_gain_on_track()
    test_loss_is_off_track()
    test_reef_glare_up_is_off_track()
    test_hold_stable_is_on_track()
    test_pv_darkening_counts()
    test_milestones_have_four_gates()
    test_drop_broken_year()
    print("ok")
