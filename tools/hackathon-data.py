"""Build hackathon-data.js for the GeoHackathon page from the committed study results.

The inputs are files of the design repository (origin/development and the model-picks commit).
Export each one with `git show <ref>:<path>` into <data_dir>, with the "/" of its path replaced by "__"
(the model picks as mp_picks.csv and mp_stress.csv). The agent run ledgers are read from <repo_dir> with git.

Usage: python tools/hackathon-data.py <data_dir> <repo_dir> hackathon-data.js
Author: Sa'eed Telvari
"""
import csv
import json
import re
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
        # for the plant builder: unmet cooling (MWh), bought gas (MWh) and electricity (MWh)
        r1(r["unmet_cooling_mwh"], 1), int(float(r["purchased_gas_mwh"])), int(float(r["electricity_mwh"])),
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

# Model picks and their 13 tests: the 5 Nov set (mp_*.csv) and the 22 Nov set (mp_new_*.csv, commit cd1ef95,
# study_results/2026-11-22/model_picks_new). Pick 0 of each set is our pick, so the second set skips it.
picks = []
for prefix in ("mp_", "mp_new_"):
    mstress = {}
    for r in rows(prefix + "stress.csv"):
        mstress.setdefault(int(r["pick"]), []).append(1 if r["meets_all_hard_rules"] == "True" else 0)
    for i, r in enumerate(rows(prefix + "picks.csv")):
        if prefix == "mp_new_" and r["model"] == "Our pick":
            continue
        req = json.loads(r["request"])
        picks.append({
            "model": r["model"], "question": r["question"], "design": r["design"],
            "boiler": float(r["boiler_mw"]), "chiller": float(r["chiller_mw"]),
            "doublets": req.get("n_doublets"), "depth": req.get("depth_m"),
            "lcoe": float(r["knmi2025_lcoe"]), "co2": int(float(r["knmi2025_co2_t"])),
            "passed": int(r["stress_passed"]), "tests": mstress.get(i, []),
        })


# Agent paths from the run ledgers (full design brief, max reasoning)
BASE = "origin/development:simulator_examples/agent_compare_results/2026-11-04-objective-newdefaults/"
CALL_KIND = {"describe_inputs": "setup", "list_models": "setup", "reservoir_simulation": "setup", "screen": "screen",
             "run_design": "design", "get_run": "inspect", "compare_runs": "inspect", "log_option": "inspect",
             "stress_test": "stress", "cross_check": "check", "sensitivity": "check",
             "ask_user": "talk", "memory_write": "talk", "memory_read": "talk", "write_model": "design"}

# The live sessions on the page. Add a model here when its run ledger and transcript are committed:
# key: (folder under BASE, transcript name, continued folder or None).
NEW = "8607d12:simulator_examples/agent_bench_results/2026-11-21-max/"
RUNS = {
    "deepseek": ("r1", "transcripts/10_design_with_objective.jsonl", None),
    "sol": ("sol_r1", "transcripts/10_design_with_objective.jsonl",
            ("sol_r1_continued", "10_design_with_objective_continued.jsonl")),
    # 21 Nov benchmark, case B1 ("find the cheapest design"), commit 8607d12 on the benchmark branch.
    "sol62": (NEW + "gpt-6.2-sol_fill_B1_r2/gpt-6.2-sol/B1/r2", "transcripts/B1.jsonl", None),
    "sonnet55": (NEW + "claude-sonnet-5.5_A/claude-sonnet-5.5/B1/r1", "transcripts/B1.jsonl", None),
    "hydrogen": ("24a670d:simulator_examples/agent_bench_results/2026-11-21-max/gemini-4-hydrogen_A/gemini-4-hydrogen/B1/r1",
                 "transcripts/B1.jsonl", None),
}


def git_text(path):
    """A file of the design repository. A path with its own "ref:" is read as it is; other paths are under BASE."""
    spec = path if ":" in path else BASE + path
    return subprocess.run(["git", "-C", REPO, "show", spec], capture_output=True, text=True, encoding="utf-8").stdout


def clock(stamp):
    """Seconds since midnight of an ISO time stamp or a bare HH:MM:SS."""
    h, m, sec = stamp[-8:].split(":")
    return int(h) * 3600 + int(m) * 60 + int(float(sec))


def clip(text, n):
    text = " ".join(str(text).split())
    text = re.sub(r"[A-Za-z]:\\[^\"',;]*", "<local path>", text)  # no local file paths on the public page
    return text if len(text) <= n else text[: n - 1].rsplit(" ", 1)[0] + "…"


def grab(pattern, text, cast=str):
    m = re.search(pattern, text)
    return cast(m.group(1)) if m else None


def eur(v):
    return f"€{v:.2f}/MWh" if v is not None else ""


def summarise(name, args, res):
    """A short, plain line for one tool call and one for its result (from the truncated result preview)."""
    a = ""
    if name == "screen":
        parts = []
        for k, label in (("n_doublets", "doublets"), ("depths_m", "depths")):
            if k in args:
                parts.append(f"{label} {args[k]}")
        if "vary" in args:
            parts.append("vary " + ", ".join(args["vary"].keys()))
        a = "; ".join(parts)
    elif name in ("run_design",):
        a = f"{args.get('n_doublets', '?')} doublets at {args.get('depth_m', '?')} m, {args.get('upgrade', '')}, {args.get('cooling', '')}"
    elif name in ("get_run", "stress_test", "cross_check", "compare_runs"):
        a = " ".join(str(args.get(k)) for k in ("run_id", "day", "baseline_run_id", "cases") if args.get(k))
    elif name == "sensitivity":
        a = f"{args.get('run_id')}: {args.get('parameter')} = {args.get('values')}"
    elif name == "reservoir_simulation":
        a = f"{args.get('depth_m')} m, {args.get('flow_m3h')} m³/h"
    elif name in ("ask_user",):
        a = args.get("question", "")
    elif name == "write_model":
        a = f"{args.get('name', 'model')}: new model code in the sandbox"
    elif name in ("memory_write", "log_option"):
        a = args.get("text") or args.get("option") or ""
    a = clip(a, 150)

    ok = None
    if res.lstrip().startswith('{"error"'):
        return a, "Gate 1 rejected the call: " + clip(grab(r'"error":"([^"]*)', res) or "invalid arguments", 120), False
    if name == "screen":
        n = grab(r'"designs_run":(\d+)', res, int)
        m = grab(r'"meet_all_rules":(\d+)', res, int)
        best = grab(r'"best_by_lcoe":\[\{"run_id":"(R\d+)"', res)
        lc = grab(r'"best_by_lcoe":\[\{[^}]*?"lcoe_eur_per_mwh":([\d.]+)', res, float)
        r = f"{n} plants run, {m} meet every rule" + (f"; best {best} at {eur(lc)}" if best else "")
    elif name == "run_design":
        rid = grab(r'"run_id":"(R\d+)"', res)
        lc = grab(r'"lcoe_eur_per_mwh":([\d.]+)', res, float)
        co2 = grab(r'"co2_t_per_year":([\d.]+)', res, float)
        okr = grab(r'"meets_all_hard_rules":(true|false)', res)
        ok = okr == "true" if okr else None
        reused = '"reused_earlier_run":true' in res
        r = f"{rid}" + (" (reused)" if reused else "") + (f": {eur(lc)}" if lc else "") + (f", {co2 / 1000:.2f} kt CO₂" if co2 else "") + (", every rule met" if ok else ", breaks a rule" if ok is False else "")
    elif name == "stress_test":
        cases = re.findall(r'"case":"(\w+)","run_id":"R\d+","meets_all_hard_rules":(true|false),"unmet_heating_mwh":([\d.]+),"unmet_cooling_mwh":([\d.]+)', res)
        bits = []
        for c, m, uh, uc in cases:
            unmet = float(uh) + float(uc)
            bits.append(f"{c.replace('_', ' ')} {'✓' if m == 'true' else '✗'}" + (f" ({unmet:.0f} MWh short)" if unmet > 0.5 else ""))
        expected = len(args.get("cases") or []) or 5  # without a list the tool runs all five cases
        ok = all(m == "true" for _, m, _, _ in cases) if cases else None
        if len(cases) < expected:
            ok = False if ok is False else None  # the log keeps only the start of the result
            bits.append(f"{expected - len(cases)} more case{'s' if expected - len(cases) > 1 else ''} in the full result")
        r = "; ".join(bits) or "cases run"
    elif name == "cross_check":
        agrees = grab(r'"agrees":(true|false|null)', res)
        date = grab(r'"date":"([\d-]+)"', res)
        ok = agrees == "true" if agrees in ("true", "false") else None
        r = f"peak day {date}: GEMINI’s solver " + ("agrees" if agrees == "true" else "disagrees" if agrees == "false" else "has no doublet running")
    elif name == "sensitivity":
        vals = re.findall(r'"lcoe_eur_per_mwh":([\d.]+)', res)
        r = "LCOE " + " → ".join(f"€{float(v):.2f}" for v in vals[:4])
    elif name == "reservoir_simulation":
        t = grab(r'"reservoir_temperature_c":([\d.]+)', res, float)
        r = f"reservoir at {t:.0f} °C" if t else "reservoir model run"
    elif name == "describe_inputs":
        r = "brief: 30 MW heat peak, 10 MW cooling peak, hard rules"
    elif name == "list_models":
        r = "GEMINI component models and our new ones"
    elif name in ("get_run", "compare_runs"):
        rid = grab(r'"run_id":"(R\d+)"', res)
        design = grab(r'"design":"([^"]+)"', res)
        r = f"{rid}: {design}" if design else "run read"
    elif name == "log_option":
        r = "logged: " + (grab(r'"verdict":"([^"]+)"', res) or "") + ("; " + grab(r'"pareto":"([^"]+)"', res) if grab(r'"pareto":"([^"]+)"', res) else "")
    elif name == "memory_write":
        r = "saved to project notes"
    elif name == "memory_read":
        r = "read the project notes"
    elif name == "write_model":
        cls = grab(r'"class":"([^"]+)"', res)
        reg = grab(r'"registered_as":"([^"]+)"', res)
        r = (f"registered {reg} ({cls}) after its tests" if reg else "model written")
    elif name == "ask_user":
        r = "waits for the engineer"
    else:
        r = clip(res, 100)
    return a, clip(r, 160), ok


def plain(md):
    """The first real paragraph of a Markdown answer, as plain text."""
    md = re.sub(r"\[(R\d+)\]", r"\1", md)
    blocks = [re.sub(r"[*#`]", "", b).strip() for b in md.split("\n\n")]
    blocks = [b for b in blocks if len(b) > 40 and not b.startswith("|")]
    return clip(blocks[0] if blocks else md, 420)


def session_events(events, t0, offset=0):
    out = []
    for e in events:
        if "t" not in e:
            continue
        t = clock(e["t"]) - t0 + offset
        k = e.get("kind")
        if "name" in e and "arguments" in e:
            a, r, ok = summarise(e["name"], e["arguments"], str(e.get("result_preview", "")))
            ev = {"t": t, "k": "tool", "name": e["name"], "cat": CALL_KIND.get(e["name"], "inspect"), "a": a, "r": r,
                  "ok": ok, "s": round(e.get("seconds") or 0, 1)}
            if e["name"] == "stress_test":
                ev["cases"] = len(e["arguments"].get("cases") or []) or 5
            out.append(ev)
        elif k == "llm":
            think = e.get("reasoning") or ""  # the content of the last call is the answer, shown on its own
            out.append({"t": t, "k": "llm", "pt": e.get("prompt_tokens") or 0, "ct": e.get("completion_tokens") or 0,
                        "rt": e.get("reasoning_tokens") or 0, "lat": round(e.get("latency_s") or 0, 1),
                        "usd": round(e.get("billed_usd") or 0, 5), "think": clip(think, 260) if think else "",
                        "n": len(e.get("tool_calls") or [])})
        elif k == "user":
            out.append({"t": t, "k": "user", "text": clip(e.get("text", ""), 420)})
        elif k == "reply":
            out.append({"t": t, "k": "ask" if e.get("reply_kind") == "question" else "answer", "text": plain(e.get("text", ""))})
    return out


def ledger(key):
    """One live session: its designs, its event log and its length, timed from the start of the session."""
    folder, transcript, cont = RUNS[key]
    events = [json.loads(l) for l in git_text(f"{folder}/{transcript}").splitlines() if l.strip()]
    t0 = clock(events[0]["t"])
    log = session_events(events, t0)
    recs = [json.loads(l) for l in git_text(f"{folder}/run_ledger.jsonl").splitlines() if l.strip()]
    pts = []
    for rec in recs:
        if rec["kind"] != "design":
            continue
        h = rec["headline"]
        pts.append([clock(rec["time"]) - t0, r1(h["co2_t_per_year"] / 1000, 2), r1(h["lcoe_eur_per_mwh"], 2),
                    rec["request"]["n_doublets"], 1 if h.get("physics_gate") == "pass" else 0,
                    1 if h.get("meets_all_hard_rules") else 0, int(rec["run_id"][1:])])
    end = max([e["t"] for e in log] + [p[0] for p in pts])
    if cont:
        # The engineer answered a question later; the continued session follows after a short gap on this timeline.
        cevents = [json.loads(l) for l in git_text(f"{cont[0]}/{cont[1]}").splitlines() if l.strip()]
        start = end + 40
        log.append({"t": start - 20, "k": "gap", "text": "The session waits for the engineer’s answer."})
        t0c = clock(next(e["t"] for e in cevents if e.get("kind") == "user"))  # the start record has another clock
        log += session_events([e for e in cevents if clock(e["t"]) >= t0c], t0c, offset=start)
        end = max(e["t"] for e in log)
    calls = [[e["t"], e["cat"]] for e in log if e["k"] == "tool"]
    return {"pts": pts, "calls": calls, "log": log, "end": end + 20}


agents = {key: ledger(key) for key in RUNS}

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
