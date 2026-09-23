// Shared by the homepage renderer and its worker. Coordinates are SVG units.
const HeroGeology = (() => {
  const layerFraction = (t, x, phase, wavelength) =>
    t + 0.08 * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * x / wavelength + phase);

  const capRockBaseProfile = (x, depth = 1, g) => (
    g.baseDepth + x * g.dipSlope
    - g.amp1 * Math.sin((x + g.phase1) * Math.PI / g.lambda1)
    - g.amp2 * Math.sin(x * Math.PI / g.lambda2)
    - g.amp3 * Math.sin(x * Math.PI / g.lambda3)
  ) * layerFraction(depth, x, g.capThicknessPhase, g.thicknessWavelength);

  const stratumBaseProfile = (x, depth = 1, yOffset = 0, g) => {
    const roof = capRockBaseProfile(x, depth, g);
    if (!yOffset) return roof;
    const top = capRockBaseProfile(x, 1, g);
    const wave = Math.sin(2 * Math.PI * x / g.thicknessWavelength + g.reservoirThicknessPhase);
    if (depth < 0.5) {
      // The shallow bed occupies part of the seal, with clearance for fault steps.
      return roof + (top - roof - 0.4 * g.faultThrow - 8) * (0.45 + 0.15 * wave);
    }
    const floor = top + 65 + (435 - top) * (g.reservoirThickness / 300) * (0.65 + 0.30 * wave);
    const t = Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320));
    // Lower beds redistribute the remaining height; the bottom never moves.
    return t === 1 ? 580 : floor + (580 - floor) * layerFraction(t, x, g.aquiferThicknessPhase, g.thicknessWavelength * 1.2);
  };

  const getStratumFaultIntersection = (fault, depth = 1, yOffset = 0, g) => {
    const x0 = fault.xPercent * 10;
    const slope = fault.dipSlope || 0;
    let x = x0;
    for (let i = 0; i < 3; i++) x = x0 + slope * stratumBaseProfile(x, depth, yOffset, g);
    return { x, y: stratumBaseProfile(x, depth, yOffset, g), x0, slope };
  };

  const getFaultIntersection = (fault, depth = 1, g) => getStratumFaultIntersection(fault, depth, 0, g);

  const stratumY = (x, faults, cell = null, depth = 1, yOffset = 0, g) => {
    let y = stratumBaseProfile(x, depth, yOffset, g);
    const reference = cell === null ? x : cell * 5 + 2.5;
    const lowerFraction = depth === 1 ? Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320)) : 0;
    const throwScale = depth < 0.5 ? depth : 1 - lowerFraction;
    faults.forEach((fault, i) => {
      if (reference > getStratumFaultIntersection(fault, depth, yOffset, g).x) {
        y += (i % 2 ? -1 : 1) * g.faultThrow * throwScale;
      }
    });
    return y;
  };

  const capRockY = (x, faults, cell = null, depth = 1, g) => stratumY(x, faults, cell, depth, 0, g);
  const layerThicknessAt = (x, depth, faults, cell, g) =>
    stratumY(x, faults, cell, depth, depth < 0.5 ? g.shallowThickness : g.reservoirThickness, g)
    - capRockY(x, faults, cell, depth, g);

  // A permeable fault shares one gas-water level across its two adjacent columns.
  // Solve for that level without creating or removing CO2 from either reservoir.
  const balanceFaultContact = (h, left, right, roofLeft, roofRight, maxLeft, maxRight) => {
    const total = h[left] + h[right];
    if (total <= 0) return;
    let low = Math.min(roofLeft, roofRight);
    let high = Math.max(roofLeft + maxLeft, roofRight + maxRight);
    for (let i = 0; i < 24; i++) {
      const level = (low + high) / 2;
      const gas = Math.max(0, Math.min(maxLeft, level - roofLeft))
        + Math.max(0, Math.min(maxRight, level - roofRight));
      if (gas < total) low = level;
      else high = level;
    }
    const level = (low + high) / 2;
    h[left] = Math.max(0, Math.min(maxLeft, level - roofLeft));
    h[right] = total - h[left];
  };

  return { capRockBaseProfile, stratumBaseProfile, getStratumFaultIntersection,
    getFaultIntersection, stratumY, capRockY, layerThicknessAt, balanceFaultContact };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = HeroGeology;
