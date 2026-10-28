# North Sea CO₂ storage map — research and decisions

Date: 2026-10-28. A research agent collected these facts from public sources. It edited no file and downloaded no dataset. Coordinates are approximate, in decimal degrees (lat, lon).

## User decisions (2026-10-28)

- The map uses public data. A subagent may query the official map services of the UK (NSTA) and the Netherlands (NLOG). Norway and Denmark show as project markers only, because their data terms are not confirmed.
- The site is non-commercial. The NSTA licence allows that.
- Countries: the UK and its neighbours (Netherlands, Norway, Denmark).
- Labels: project names only. Never company names. Nothing that points to the owner's own MuPSI case study.
- Groups on the map: depleted-gas projects, pilots and studies, saline flagship projects, and ceased gas fields as grey points. Depleted oil (Greensand) is left out.
- Camelot shows with the status "withdrawing (2026)".
- Where sources differ on a date, use the newest official source, else the newest source.

## Coordinate methods

- M1: NSTA field outline, centroid from the ArcGIS service (`returnCentroid`).
- M2: NSTA licence or storage-site polygon, same method.
- M3: NLOG field or licence outline, centre of the bounding box.
- M4: Sodir licence or field outline, centre of the bounding box.
- M5: GEUS/Energistyrelsen platform position (a platform, not a field centre).

## Group 1: depleted-gas projects

| Project | Ctry | Fields | Status (date) | Lat, lon (method) | Source |
|---|---|---|---|---|---|
| HyNet / Liverpool Bay CCS | UK | Hamilton, Hamilton North (gas); Lennox (oil and gas) | Licence CS004 (2020). Storage permits 22 Apr 2025. In construction. First injection from mid-2028 | Hamilton 53.5674, -3.4524; Hamilton North 53.6451, -3.4736; Lennox 53.6314, -3.1723 (M1) | https://nstauthority.co.uk/news-publications/2bn-hynet-carbon-storage-project-will-provide-massive-jobs-and-net-zero-boost |
| Morecambe Net Zero | UK | North Morecambe, South Morecambe (still producing) | Licence CS010 (2023). Assess phase 9 Jun 2026. Storage around 2030 | North 53.9612, -3.6746; South 53.8691, -3.5967 (M1) | https://www.nstauthority.co.uk/the-move-to-net-zero/projects/Barrow-in-Furness/ |
| Viking CCS | UK | Viking A–E, Victor | Licence CS005 (2021). Government development funding Jul 2026. No FID | Licence 53.3987, 2.2781 (M2); fields A 53.5312, 2.2233 · B 53.4278, 2.3665 · C 53.4323, 2.1510 · D 53.4335, 2.2611 · E 53.4779, 2.2300 · Victor 53.3312, 2.3344 (M1) | Company and trade sources only; licence record in the NSTA layer |
| Poseidon | UK | Leman (still producing) | Licence CS009 (2023). Injection test at Leman 2025 (pilot). Target start 2029 | Leman 53.0635, 2.1927 (M1) | NSTA licence list; test: trade press |
| Orion | UK | Amethyst East, Amethyst West, West Sole (producing) | Licences CS017, CS018 (2023). Target 2031 | Amethyst E 53.5996, 0.7943; W 53.6547, 0.6061; West Sole 53.7215, 1.1132 (M1) | NSTA licence list |
| Bacton CCS | UK | Hewett | Licence CS008 (2023). Appraisal well 2025. Injection by 2030 | Hewett 53.0219, 1.7720 (M1) | https://www.nstauthority.co.uk/the-move-to-net-zero/projects/bacton/ |
| Camelot CCS | UK | Camelot North, North East, Central South | Licence CS019 (2023). Licensee to relinquish (Jun 2026): show "withdrawing (2026)" | N 52.9586, 2.1403; NE 52.9669, 2.2310; CS 52.9398, 2.1559 (M1) | Company notice (16 Jun 2026); licence record in the NSTA layer |
| Porthos | NL | P18-2, P18-4 (P18-6 later) | Storage licences effective. FID 2023. In construction. Start second half of 2027 | P18-2 52.1275, 3.9444; P18-4 52.1396, 3.8989; P18-6 52.1668, 3.9423 (M3) | https://www.porthosco2.nl/en/ ; NLOG |
| Aramis | NL | K14-FA, L04-A, L10-ALBE | Permits 2025, appeal pending, no FID (Sep 2026). Start 2028–2030 | K14-FA 53.2811, 3.6298; L04-A 53.7289, 4.0888; L10-ALBE 53.4396, 4.2225 (M3) | https://aramis-ccs.com/news ; NLOG |
| Q16-FA, L09-FF | NL | Q16-FA, L09-FF | Storage licence applied (no project name) | Q16-FA 52.0440, 4.0440; L09-FF 53.6090, 4.9552 (M3) | NLOG |
| Bifrost | DK | Harald | Exploration licence 2023. No storage permit. Target 2030 | Harald B 56.3441, 4.2719 (M5) | https://offshore.dtu.dk/research/co2-storage/bifrost-an-innovative-co2-storage-project |

## Group 2: pilots and studies

| Item | Ctry | Status | Lat, lon | Source |
|---|---|---|---|---|
| K12-B | NL | CO₂ injection pilot from 2004 | 53.3424, 3.8856 (M3) | https://repository.tudelft.nl/record/uuid:ea9253d0-9797-4976-beb1-31e81d7af5a5 |
| Leman injection test (Poseidon) | UK | Test 2025 | 53.0635, 2.1927 (M1) | trade press |
| Peterhead / Goldeneye | UK | Study; cancelled 2015 | 58.0028, -0.3681 (M1) | UK government storage development plan |
| Frigg, Heimdal | NO | Published studies only | Frigg 59.918, 2.124; Heimdal 59.585, 2.223 (M4) | Sodir CO₂ atlas, section 4.2.2 |

## Group 3: saline flagship projects (context, different marker style)

| Project | Ctry | Status | Lat, lon | Source |
|---|---|---|---|---|
| Endurance | UK | Permit Dec 2024. In construction. First injection 2027–2028 | 54.2048, 1.0413 (M2) | https://www.nstauthority.co.uk/news-publications/nsta-awards-endurance-first-ever-uk-carbon-storage-permit |
| Acorn | UK | Licence CS003 (2018). Development funding 2025. No FID | 57.9919, -0.3845 (M2) | NSTA layer |
| Northern Lights | NO | Injection from 2025 | 60.458, 3.640 (M4) | https://jpt.spe.org/northern-lights-stores-first-carbon-dioxide |
| Sleipner | NO | Injection since 1996 | 58.388, 1.939 (M4) | https://equinor.industriminne.no/en/ccs-on-sleipner-back-where-it-came-from/ |
| Smeaheia | NO | Licence 2022. Start about 2028 | 60.625, 4.248 (M4) | https://www.equinor.com/en/news/20220405-awarded-smeaheia-polaris-co2-licenses.html |

Do not link Acorn and Goldeneye on the map.

## Group 4: ceased gas fields (grey points)

- UK: NSTA "UKCS offshore hydrocarbon fields (WGS84)", query service `https://services-eu1.arcgis.com/OZMfUznmLTnWccBc/arcgis/rest/services/Offshore_hydrocarbon_fields_(WGS84)/FeatureServer/0`. Select `FIELDTYPE IN ('GAS','COND') AND STAT_CODE IN ('899','900','1000')` (about 126 fields). Query with `returnGeometry=false&returnCentroid=true&outSR=4326&outFields=FIELDNAME` (about 3 KB).
- Netherlands: NLOG WFS `https://www.gdngeoservices.nl/geoserver/nlog/ows`, layer `nlog:gdw_ng_field_utm`, `srsName=EPSG:4326`. Select gas fields with a ceased status.
- Project field outlines (UK): the same NSTA service, by field name, with `maxAllowableOffset=0.005&geometryPrecision=3&f=geojson` (about 10 KB for 27 fields).

## Attribution (show on the map)

"Contains information provided by the North Sea Transition Authority and/or other third parties." (NSTA, word for word; non-commercial use; no NSTA logo; no hint of endorsement.) "Source: NLOG.NL." Project status from public sources, 28 Oct 2026.

## Open points

- Dates that differ between sources: Endurance first injection (2027 or 2028), Aramis start (2028–2030), Poseidon FID (2026 or 2027).
- The Danish and Norwegian data terms are not confirmed. Only marker positions from public pages are used for them.
