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
| HyNet / Liverpool Bay CCS | UK | Hamilton, Hamilton North (gas); Lennox (oil and gas) | Storage permits granted in Apr 2025. First injection as soon as mid-2028. (Dropped: "in construction", not on this page.) | Hamilton 53.5674, -3.4524; Hamilton North 53.6451, -3.4736; Lennox 53.6314, -3.1723 (M1) | https://nstauthority.co.uk/news-publications/2bn-hynet-carbon-storage-project-will-provide-massive-jobs-and-net-zero-boost |
| Morecambe Net Zero | UK | North Morecambe, South Morecambe (still producing) | The gas fields still produce. Storage can start in 2030, after a final investment decision and approvals. (Dropped: licence CS010 (2023) and the assess phase, not on this page.) | North 53.9612, -3.6746; South 53.8691, -3.5967 (M1) | https://www.nstauthority.co.uk/the-move-to-net-zero/projects/Barrow-in-Furness/ |
| Viking CCS | UK | Viking A–E, Victor | Government development funding approved in Jul 2026. No final investment decision yet. (Dropped: licence CS005 (2021), no page gives its date.) | Licence 53.3987, 2.2781 (M2); fields A 53.5312, 2.2233 · B 53.4278, 2.3665 · C 53.4323, 2.1510 · D 53.4335, 2.2611 · E 53.4779, 2.2300 · Victor 53.3312, 2.3344 (M1) | https://www.energy-pedia.com/news/united-kingdom/viking-ccs-development-funding-approved-204638 |
| Poseidon | UK | Leman (still producing) | Storage licence CS009 (2023). Injection test at the Leman field in 2025. Target start 2030 (the newest source, Apr 2026; older sources say 2029). | Leman 53.0635, 2.1927 (M1) | https://gccc.beg.utexas.edu/files/gccc/research/goi/2026/4.3%20Poseidon_Injection%20Test_IEAGHG%20Workshop_20%2004%202026_FINAL.pdf |
| Orion | UK | Amethyst East, Amethyst West, West Sole (producing) | Storage licences CS017 and CS018 (2023). Target start 2031 | Amethyst E 53.5996, 0.7943; W 53.6547, 0.6061; West Sole 53.7215, 1.1132 (M1) | https://gccc.beg.utexas.edu/files/gccc/research/goi/2026/4.3%20Poseidon_Injection%20Test_IEAGHG%20Workshop_20%2004%202026_FINAL.pdf |
| Bacton CCS | UK | Hewett | Storage licence awarded in 2023. Appraisal well drilled in 2025. Target: first injection by 2030. (Dropped: licence number CS008, not on this page.) | Hewett 53.0219, 1.7720 (M1) | https://www.nstauthority.co.uk/the-move-to-net-zero/projects/bacton/ |
| Camelot CCS | UK | Camelot North, North East, Central South | Withdrawing (2026). In Jun 2026 a licence holder said it will apply to give up storage licence CS019. Show "withdrawing (2026)". | N 52.9586, 2.1403; NE 52.9669, 2.2310; CS 52.9398, 2.1559 (M1) | https://shareprices.com/rns/camelot-ccs-and-cambay-psc-update-1k0gfxtclm85qle/ (company notice of 16 Jun 2026) |
| Porthos | NL | P18-2, P18-4 (P18-6 later) | Storage permits final since Sep 2022. Final investment decision in Oct 2023. In construction. Start not before the second half of 2027. | P18-2 52.1275, 3.9444; P18-4 52.1396, 3.8989; P18-6 52.1668, 3.9423 (M3) | https://www.porthosco2.nl/en/project/ |
| Aramis | NL | K14-FA, L04-A, L10-ALBE | Permits granted. An appeal against the permits is pending. Final investment decision planned for 2027. Operation planned for 2030 (the newest source, 3 Sep 2026; older sources say 2028). | K14-FA 53.2811, 3.6298; L04-A 53.7289, 4.0888; L10-ALBE 53.4396, 4.2225 (M3) | https://www.aramis-ccs.com/news/aramis-advances-towards-final-investment-decision-prepares-leadership-for-execution-phase/ |
| Q16-FA, L09-FF | NL | Q16-FA, L09-FF | A storage permit application was received: Q16-FA (notice of 14 Oct 2025), L09-FF (notice of 23 Sep 2025). Dropped: "the project has no name yet". The Dutch government names the Q16-FA project "Kompas" (Staatscourant 2026, 95) and the L09 project "L09 CO₂-opslagproject". | Q16-FA 52.0440, 4.0440; L09-FF 53.6090, 4.9552 (M3) | Q16-FA: https://zoek.officielebekendmakingen.nl/stcrt-2025-35278.html ; L09-FF: https://zoek.officielebekendmakingen.nl/stcrt-2025-32645.html |
| Bifrost | DK | Harald | Exploration licence approved in Feb 2023. Possible capacity: more than 5 million tonnes of CO₂ a year by 2030. (Dropped: "no storage permit yet", not on this page.) | Harald B 56.3441, 4.2719 (M5) | https://www.enerdata.net/publications/daily-energy-news/denmark-approves-3-co2-storage-licences-north-sea.html |

## Group 2: pilots and studies

| Item | Ctry | Status | Lat, lon | Source |
|---|---|---|---|---|
| K12-B | NL | CO₂ injection pilot from 2004. More than 100,000 tonnes injected. The operation is complete. | 53.3424, 3.8856 (M3) | https://repository.tno.nl/SingleDoc?docId=49542 (the TU Delft repository link was dead: it timed out in a script, in the web fetch tool and in the browser) |
| Leman injection test (Poseidon) | UK | Test 2025 | 53.0635, 2.1927 (M1) | Same source as Poseidon (the map shows one marker) |
| Peterhead / Goldeneye | UK | Plan to store CO₂ in a depleted gas field. Called off in 2015, after the government cancelled its CCS competition. | 58.0028, -0.3681 (M1) | https://commonslibrary.parliament.uk/research-briefings/cdp-2017-0023/ |
| Frigg | NO | Gas production ended in 2004. A 2010 state study modelled CO₂ injection into the field. | 59.918, 2.124 (M4) | https://www.sodir.no/en/whats-new/publications/co2-atlases/co2-atlas-for-the-norwegian-continental-shelf/4-the-norwegian-north-sea/4.2-storage-options-in-the-north-sea/4.2.2-abandoned-hydrocarbon-fields (section 4.2.2 of the CO₂ atlas) |
| Heimdal | NO | A 2016 study found storage here possible but less attractive than at Smeaheia. | 59.585, 2.223 (M4) | https://www.earthdoc.org/content/papers/10.3997/2214-4609.201702142 (the atlas does not describe a Heimdal storage study) |

## Group 3: saline flagship projects (context, different marker style)

| Project | Ctry | Status | Lat, lon | Source |
|---|---|---|---|---|
| Endurance | UK | Storage permit granted in Dec 2024. In construction. Start-up expected in 2028 (the newest source, Jan 2026; the permit page of Dec 2024 says first injection by 2027). | 54.2048, 1.0413 (M2) | https://www.energy-pedia.com/news/united-kingdom/northern-endurance-partnership-and-the-crown-estate-sign-lease-for-uk%E2%80%99s-first-ccs-project-ahead-of-offshore-construction-202595 |
| Acorn | UK | Government agreed about £200 million for development in Jun 2025, subject to a business case. The money is for work before a final investment decision. (Dropped: licence CS003 (2018), no page gives its date.) | 57.9919, -0.3845 (M2) | https://www.gov.uk/government/news/funding-secured-for-britains-industrial-future |
| Northern Lights | NO | Injecting since 2025 | 60.458, 3.640 (M4) | https://www.sodir.no/en/whats-new/publications/reports/the-shelf/the-shelf-in-2025/new-industries-on-the-shelf/ |
| Sleipner | NO | Injecting since 1996 | 58.388, 1.939 (M4) | https://www.norskpetroleum.no/en/environment-and-technology/carbon-capture-and-storage/ |
| Smeaheia | NO | Exploration licence awarded in 2022. Two wells in 2025 showed that the reservoir suits CO₂ storage. (Dropped: "start about 2028". The current page of the licensee says early 2030s, and no official page gives a start.) | 60.625, 4.248 (M4) | https://www.sodir.no/en/whats-new/news/exploration-drilling-results/2025/the-wells-327-1-and-324-4-proved-suitable-properties-for-injection-and-storage-of-co2 |

Do not link Acorn and Goldeneye on the map.

## Group 4: ceased gas fields (grey points)

- UK: NSTA "UKCS offshore hydrocarbon fields (WGS84)", query service `https://services-eu1.arcgis.com/OZMfUznmLTnWccBc/arcgis/rest/services/Offshore_hydrocarbon_fields_(WGS84)/FeatureServer/0`. Select `FIELDTYPE IN ('GAS','COND') AND STAT_CODE IN ('899','900','1000')` (about 126 fields). Query with `returnGeometry=false&returnCentroid=true&outSR=4326&outFields=FIELDNAME` (about 3 KB).
- Netherlands: NLOG WFS `https://www.gdngeoservices.nl/geoserver/nlog/ows`, layer `nlog:gdw_ng_field_utm`, `srsName=EPSG:4326`. Select gas fields with a ceased status.
- Project field outlines (UK): the same NSTA service, by field name, with `maxAllowableOffset=0.005&geometryPrecision=3&f=geojson` (about 10 KB for 27 fields).

## Attribution (show on the map)

"Contains information provided by the North Sea Transition Authority and/or other third parties." (NSTA, word for word; non-commercial use; no NSTA logo; no hint of endorsement.) "Source: NLOG.NL." Project status from public sources, 28 Oct 2026.

## Open points

- Dates that differ between sources. The map uses the newest source: Endurance start-up 2028 (Jan 2026; the permit page of Dec 2024 says first injection by 2027), Aramis operation 2030 (3 Sep 2026; older sources say 2028), Poseidon start 2030 (Apr 2026; older sources say 2029). Poseidon FID (2026 or 2027) is not on the map.
- The Danish and Norwegian data terms are not confirmed. Only marker positions from public pages are used for them.

## How the map is built and how to update it

The stage `fields` of the story draws `assets/north-sea-ccs.json`. A script makes the file from two public map services and one table.

- **The table.** `tools/north-sea-projects.json` holds the projects: name, country, group, status, year, points and source link. It holds no company name. Change a status or a year here.
- **The script.** `tools/north-sea-map.js` asks NSTA (UK) and NLOG (NL), and no other service. It asks for field names, field codes, status and shape. It never asks for an operator column. It does not ask for Norway or Denmark: these markers come from the table.
- **Run it again.** Run `node tools/north-sea-map.js` in the repository folder. It needs Node 18 or newer and a network connection. It writes `assets/north-sea-ccs.json` and stops with an error if the file is larger than 40 KB.
- **After a run.** Run `node --test tests/*.test.js`. The test `tests/story-fields.test.js` checks the file. Then change `?v=1` in `STORY_FIELDS_FILE` (StoryFields.jsx) and the `bundle.js?v=` number on the three pages, so that the browser loads the new file.
- **The marker of a project** is the mean of its points in the table. For a project with several fields, the outlines of the fields show where the gas fields are.
- **UK grey points.** Gas and condensate fields with the NSTA status codes 899, 900 and 1000 (126 fields on 28 Oct 2026). The fields of the projects are not grey points: they have outlines.
- **NL grey points.** Gas fields in the sea with the NLOG status "Production ceased" (U) or "Abandoned" (A): 109 fields on 28 Oct 2026. The three P18 fields are not grey points.
- **Outlines.** NSTA gives simplified shapes (`maxAllowableOffset=0.005`). The script simplifies the NLOG shapes with the same tolerance. L10-ALBE (Aramis) is not a field in the NLOG layer, so it has no outline.

### Choices that the research file did not fix

- The Leman injection test (group 2) is at the same place as Poseidon (group 1). The map shows one marker, for Poseidon. The status of Poseidon names the test.
- Acorn and Goldeneye (Peterhead) are about 1 km apart. The heads of the two markers move apart on the screen. Their stems still end at the true places. The map does not link the two.
- **Sources (checked on 28 Oct 2026).** Each project has one link, and each sentence of its status text is on that page. If the page did not support a claim, the claim was dropped or the link was replaced. The licence numbers and licence years that no page of the project showed were dropped (Morecambe, Viking, Bacton, Acorn). An official page is used when it has the fact. A company or trade press page is used when no official page has it (Viking, Poseidon, Orion, Camelot, Aramis, Bifrost, Endurance). Sodir, Commons Library and EAGE pages, and some others, give an error 403 to a script but open in a normal browser.
- **No second link.** The data file, the list in the story and the test take one source link for each project. A second link would need a change of the code and the tests.
- **Names that the sources show.** The status "no project name yet" for Q16-FA was wrong: the Dutch government calls this project Kompas. The L09 project is called "L09 CO₂-opslagproject". The map still shows the field names. Change the names only if the owner of the site decides so.
- **Date choice.** For a date that differs between sources, the map uses the newest source (see the open points of the first part). The map shows one date for Endurance, Aramis and Poseidon, and no range.
- Colours: the blue (CO2) and the red (methane) of the story are not used for projects. A depleted gas project is a circle in the sandstone colour. A pilot or study is a cream diamond. A saline project is a small square with a chalk border. Grey points are ceased gas fields. The blue marker on the map is the example site of the story, and the map does not call it a project.
