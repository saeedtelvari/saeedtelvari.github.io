"""Build hackathon-data.js for the GeoHackathon page from the committed study results.

The inputs are files of the design repository (origin/development and the model-picks commit).
Export each one with `git show <ref>:<path>` into <data_dir>, with the "/" of its path replaced by "__"
(the model picks as mp_picks.csv and mp_stress.csv). The agent run ledgers are read from <repo_dir> with git.

Usage: python tools/hackathon-data.py <data_dir> <repo_dir> hackathon-data.js
Author: Sa'eed Telvari
"""
import csv
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

D = Path(sys.argv[1])
REPO = sys.argv[2]
OUT = Path(sys.argv[3])
MP = "simulator_examples__study_results__2026-11-04__margin_pick__"


def rows(name):
    return list(csv.DictReader(open(D / name, encoding="utf-8")))


def r1(x, n=1):
    return round(float(x), n)


# Demand (MW per day)
heat = [r1(r["heating_demand_MWth"], 2) for r in rows("simulator_examples__hackathon_inputs__GEMINI_Heating_Demand_Daily_2027.csv")]
cool = [r1(r["cooling_demand_MWcool"], 2) for r in rows("simulator_examples__hackathon_inputs__GEMINI_Cooling_Demand_Daily_2027.csv")]

# Daily dispatch of the pick (MW)
daily = rows(MP + "final_pick__pick_daily.csv")
mw = lambda r, k: round(float(r[k] or 0) / 1e6, 2)
disp = {
    "hex": [mw(r, "hex_heat_w") for r in daily],
    "chp": [mw(r, "chp_heat_w") for r in daily],
    "boiler": [round((float(r["boiler_heat_w"] or 0) + float(r["electric_boiler_heat_w"] or 0)) / 1e6, 2) for r in daily],
    "free": [mw(r, "free_cooling_w") for r in daily],
    "ates": [mw(r, "ates_cooling_w") for r in daily],
    "chiller": [round(max(0.0, float(r["cooling_delivered_w"]) - float(r["free_cooling_w"] or 0) - float(r["ates_cooling_w"] or 0)) / 1e6, 2) for r in daily],
    "flow": [r1(r["flow_per_doublet_m3h"], 0) for r in daily],
    "active": [int(float(r["n_active"])) for r in daily],
    "avail": [int(float(r["n_available"])) for r in daily],
    "dT": [r1(r["brine_cooling_k"], 1) for r in daily],
    "twh": [r1(r["wellhead_temperature_c"], 1) for r in daily],
}

# Full screen (720 designs)
COOL = ["absorption", "legacy electric", "screw + dry cooler", "centrifugal + tower", "air-cooled screw",
        "legacy + free cooling", "screw + free cooling", "tower + free cooling", "air-cooled + free cooling",
        "air-cooled + free cooling + ATES x3"]
screen = []
for r in rows(MP + "full_screen__results.csv"):
    screen.append([
        int(r["n_doublets"]), int(r["depth_m"]), 1 if r["upgrade"] == "heat_pump" else 0,
        1 if r["chp"] == "True" else 0, COOL.index(r["cooling_option"]),
        1 if r["meets_all_hard_rules"] == "True" else 0,
        r1(r["lcoe_eur_per_mwh"], 2), r1(float(r["co2_t_per_year"]) / 1000, 2), r1(r["capex_meur"], 1),
    ])

# Stress tests: our pick (3.2 km, 10 MW) and the earlier 3.1 km, 9 MW pick
stress = {}
for r in rows(MP + "stress_margin__stress.csv"):
    stress.setdefault(r["design"], []).append([r["test"], r1(r["lcoe_eur_per_mwh"], 2), r1(r["unmet_mwh"], 1)])
stress = {"pick": stress["3.2 km, 10 MW (pick)"], "prev": stress["3.1 km, 9 MW (2-4 Nov pick)"]}

# Monte Carlo of the pick
mc = [[r1(r["lcoe_eur_per_mwh"], 2), 1 if r["demand_met"] == "True" else 0]
      for r in rows(MP + "final_pick__mc_results.csv") if r["design"] == "2D-3200m-boiler-electric-chp-aircooled-fc-ates3"]
mcs = rows(MP + "final_pick__mc_summary.csv")[0]

# 35 weather years, 10 MW chiller
years = [[int(r["weather"]), r1(r["lcoe_eur_per_mwh"], 2), r1(r["mean_air_c"], 2)]
         for r in rows(MP + "weather_years__years.csv") if r["chiller_mw"] == "10.0"]

# Tornado (LCOE swing around the sourced base case)
tornado = [[r["label"], r1(r["input_low"], 4), r1(r["input_high"], 4), r1(r["lcoe_low"], 2), r1(r["lcoe_high"], 2), r1(r["lcoe_base"], 2)]
           for r in rows(MP + "final_pick__tornado_pick.csv")]

# Model picks and their 13 tests
mstress = {}
for r in rows("mp_stress.csv"):
    mstress.setdefault(int(r["pick"]), []).append(1 if r["meets_all_hard_rules"] == "True" else 0)
picks = []
for i, r in enumerate(rows("mp_picks.csv")):
    req = json.loads(r["request"])
    picks.append({
        "model": r["model"], "question": r["question"], "design": r["design"],
        "boiler": float(r["boiler_mw"]), "chiller": float(r["chiller_mw"]),
        "doublets": req.get("n_doublets"), "depth": req.get("depth_m"),
        "lcoe": float(r["knmi2025_lcoe"]), "co2": int(float(r["knmi2025_co2_t"])),
        "passed": int(r["stress_passed"]), "tests": mstress.get(i, []),
    })


# Agent paths from the run ledgers (full design brief, max reasoning)
def ledger(run):
    txt = subprocess.run(["git", "-C", REPO, "show",
                          f"origin/development:simulator_examples/agent_compare_results/2026-11-04-objective-newdefaults/{run}/run_ledger.jsonl"],
                         capture_output=True, text=True, encoding="utf-8").stdout
    recs = [json.loads(l) for l in txt.splitlines() if l.strip()]
    t0 = datetime.fromisoformat(recs[0]["time"])
    pts = []
    for rec in recs:
        if rec["kind"] != "design":
            continue
        h = rec["headline"]
        t = (datetime.fromisoformat(rec["time"]) - t0).total_seconds()
        pts.append([int(t), r1(h["co2_t_per_year"] / 1000, 2), r1(h["lcoe_eur_per_mwh"], 2),
                    rec["request"]["n_doublets"], 1 if h.get("physics_gate") == "pass" else 0,
                    1 if h.get("meets_all_hard_rules") else 0, int(rec["run_id"][1:])])
    return pts


agents = {"deepseek": ledger("r1"), "sol": ledger("sol_r1")}

data = {
    "heat": heat, "cool": cool, "disp": disp, "coolOptions": COOL, "screen": screen,
    "stress": stress, "mc": mc,
    "mcSummary": {k: float(mcs[k]) for k in ("p_demand_met", "p_demand_met_ci95_low", "p_demand_met_ci95_high", "lcoe_p10", "lcoe_p50", "lcoe_p90", "co2_kt_p10", "co2_kt_p50", "co2_kt_p90")},
    "years": years, "tornado": tornado, "picks": picks, "agents": agents,
}
OUT.write_text(
    "// hackathon-data.js — generated from the committed study results of the GeoHackathon design study.\n"
    "// Do not edit by hand.\n"
    "const HACK_DATA = " + json.dumps(data, separators=(",", ":"), ensure_ascii=False) + ";\n"
    "if (typeof module !== 'undefined' && module.exports) module.exports = { HACK_DATA };\n",
    encoding="utf-8",
)
print(OUT, OUT.stat().st_size, "bytes", len(screen), "designs", len(mc), "mc", {k: len(v) for k, v in agents.items()})
