# Geological material textures

Generated with the built-in imagegen tool on 2026-09-30. The originals remain in Codex's generated-images folder; the website uses compressed 1024 px WebP copies in `assets/`.

Each material uses the following common prompt, with its subject description inserted after “Generate one square texture of”.

> Use case: photorealistic-natural. Asset type: seamless repeating geological material texture for a realistic geological cutaway website. Generate one square texture of [subject]. Orthographic straight-on photograph of freshly exposed rock interior, a broad field with small-scale natural mineral detail. Completely fill the frame. Flat diffuse neutral illumination, constant exposure and similar tone right to every edge. Seamless tileable texture: opposite edges must meet without any visible rectangular boundary, illumination seam or obvious repeated motif. Texture variation is fine-scale and subtle across the entire area. Do not put a light patch at the center or darken edges. Scientific material photography, crisp fine detail, subdued natural colors. No horizon, surface landscape, people, objects, writing, annotations, labels, watermark, large blocks, slab outlines, dramatic cracks, faults, thick veins, gradients, vignetting, illustration or cartoon. One material only.

| Saved asset | Subject description |
| --- | --- |
| `assets/geology-shale.webp` | Dark charcoal grey shale with very fine horizontal fissile lamination, tiny clay flakes, restrained graphite and muted olive mineral flecks. No large fractures. |
| `assets/geology-sandstone.webp` | Muted ochre taupe sandstone with fine quartz sand grains, scattered darker lithic grains, small pore specks, delicate low-angle cross lamination and subtle iron-oxide mottling. |
| `assets/geology-limestone.webp` | Warm grey limestone with dense fine carbonate matrix, tiny occasional shell fragments, small irregular micro-pores and restrained pale calcite flecks. No large veins. |
| `assets/geology-basement.webp` | Muted rose-grey granite with clearly interlocking small quartz, pale pink potassium feldspar, ivory plagioclase and sparse dark biotite grains. Natural crystalline mosaic, not grey noise. No drawn fractures. |
| `assets/geology-siltstone.webp` | Earthy subdued reddish grey siltstone with very fine silt grains, faint closely spaced horizontal lamination, clay seams and restrained rusty mineral specks. |
| `assets/geology-dolomite.webp` | Pale desaturated beige grey dolostone with fine interlocking carbonate crystals, tiny scattered vugs and soft diffuse mineral mottling, a little more granular than limestone. |

The renderer blends each photograph with a half-tile offset at its edges, so bitmap borders cannot form rectangular seams. All beds of a material share the same texture origin. Fault and joint overlays are separate from the photographs and concentrated in selected carbonate beds and granite.

The succession includes three sandstone pinch-outs, gradual lateral thickness changes, and two small faults that offset only a few beds. The basement retains a gently eroded upper contact. These are illustrative features, rather than a reconstruction of one field: the [BGS central North Sea report](https://webapps.bgs.ac.uk/Memoirs/docs/B01846.html) describes sandstone pinch-outs, variable sediment thickness, and faults that terminate within particular units; [USGS](https://apps.usgs.gov/thesaurus/term-simple.php?code=1198&thcode=2) defines unconformities as contacts involving erosion of older rocks before younger sediment is deposited.

Only the hero's rock below the reservoir shares the new shale texture and slate transition. Reservoir geometry, cap rock, surface scene, and simulation calculations remain unchanged.
