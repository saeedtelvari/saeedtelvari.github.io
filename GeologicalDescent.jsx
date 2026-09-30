// A continuous material cutaway, from the hero's aquifer to crystalline basement.
const GeologicalDescent = ({ children }) => {
  const rootRef = React.useRef(null);
  const [heights, setHeights] = React.useState([1100, 1500, 850, 240]);

  React.useEffect(() => {
    const sections = [...rootRef.current.querySelectorAll('.section-panel'), rootRef.current.querySelector('footer')];
    const measure = () => {
      const next = sections.map(section => Math.round(section.offsetHeight));
      setHeights(previous => next.some((height, i) => height !== previous[i]) ? next : previous);
      // Compensate for the SVG's horizontal scaling so mineral grains stay round.
      const width = rootRef.current.clientWidth;
      if (width) rootRef.current.querySelectorAll('.descent-material').forEach(pattern => {
        const tileWidth = 840 * 1440 / width;
        pattern.setAttribute('width', tileWidth);
        pattern.querySelector('.descent-tile').setAttribute('transform', `scale(${tileWidth / 840} 1)`);
      });
    };
    const sizes = new ResizeObserver(measure);
    sections.forEach(section => sizes.observe(section));
    sizes.observe(rootRef.current);
    measure();
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => { entry.target.dataset.visible = String(entry.isIntersecting); });
    });
    rootRef.current.querySelectorAll('.descent-motion').forEach(element => visibility.observe(element));
    return () => { sizes.disconnect(); visibility.disconnect(); };
  }, []);

  const [about, research, contact, footer] = heights;
  const total = about + research + contact + footer;
  const materials = [
    'shale', 'sandstone', 'sandstone', 'siltstone', 'limestone', 'shale', 'sandstone', 'dolomite',
    'shale', 'siltstone', 'sandstone', 'limestone', 'limestone', 'shale', 'sandstone', 'siltstone',
    'shale', 'dolomite', 'sandstone', 'siltstone', 'shale', 'limestone', 'sandstone', 'dolomite',
    'shale', 'sandstone', 'siltstone', 'dolomite', 'shale', 'limestone', 'shale', 'sandstone',
    'sandstone', 'siltstone', 'limestone', 'shale', 'dolomite', 'sandstone', 'shale', 'sandstone', 'basement',
  ];
  const colors = { shale: '#303637', sandstone: '#887353', siltstone: '#63574b', limestone: '#87847a', dolomite: '#958b74', basement: '#786c65' };
  const random = seed => { const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const weights = materials.slice(0, -1).map((_, i) => .45 + random(i + 8) * 1.4);
  const basementLevel = about + research + contact * .42;
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const levels = [0];
  weights.forEach(weight => levels.push(levels[levels.length - 1] + weight / weightTotal * basementLevel));
  levels.push(total);
  // Positive, laterally varying thicknesses form wedges without crossing contacts.
  const columnProfiles = new Map();
  const baseBoundary = (i, x) => {
    if (i === 0) return 0;
    if (i === levels.length - 1) return total;
    if (columnProfiles.has(x)) return columnProfiles.get(x)[i];
    const thicknesses = weights.map((weight, n) => weight * Math.max(.12,
      1 + .34 * Math.sin(x / 360 + n * .72) + .12 * Math.cos(x / 210 - n * .46)));
    const thicknessTotal = thicknesses.reduce((sum, weight) => sum + weight, 0);
    const erosion = 32 * Math.sin(x / 310 + .8) + 12 * Math.sin(x / 110);
    const fold = 36 * Math.sin(x / 510 + .45) + 12 * Math.cos(x / 230);
    let cumulative = 0;
    const column = [0, ...thicknesses.map((weight, n) => {
      cumulative += weight;
      const fraction = .2 * cumulative / thicknessTotal + .8 * levels[n + 1] / basementLevel;
      return fraction * (basementLevel + erosion) + Math.sin(Math.PI * fraction) * fold;
    }), total];
    columnProfiles.set(x, column);
    return column[i];
  };
  const boundaryY = baseBoundary;
  // One shared smooth contact bounds both adjoining beds.
  const profiles = levels.map((_, i) => Array.from({ length: 121 }, (_, n) => [n * 12, boundaryY(i, n * 12)]));
  const trace = points => 'M' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  const beds = profiles.slice(0, -1).map((points, i) => trace(points) + 'L' +
    [...profiles[i + 1]].reverse().map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z');
  const middle = (i, x) => (boundaryY(i, x) + boundaryY(i + 1, x)) / 2;
  const bedAt = (material, y) => materials.reduce((best, rock, i) =>
    rock === material && Math.abs(levels[i] - y) < Math.abs(levels[best] - y) ? i : best, materials.indexOf(material));
  const sandstoneBed = bedAt('sandstone', about * .22);
  const lowerSandstone = bedAt('sandstone', about + research * .68);
  // Brittle carbonate intervals and granite host the fault/joint clusters.
  const fracturedBeds = [4, 12, 27, materials.length - 1];
  const fractureCounts = { shale: 0, siltstone: 1, sandstone: 2, limestone: 5, dolomite: 7, basement: 180 };
  const faults = fracturedBeds.flatMap(bed => Array.from({ length: materials[bed] === 'basement' ? 24 : 4 }, (_, n) => {
    const seed = bed * 31 + n * 7;
    const x = 65 + random(seed) * 1310;
    const top = boundaryY(bed, x), height = boundaryY(bed + 1, x) - top;
    const length = Math.min(210, height * .7) * (.65 + random(seed + 1) * .35);
    return { bed, x, y: top + height * .08 + random(seed + 2) * Math.max(0, height * .84 - length),
      length, slope: (n % 3 ? .64 : -.56), throw: n % 2 ? -7 : 7 };
  }));
  const faultX = (fault, y) => fault.x + (y - fault.y - fault.length / 2) * fault.slope;

  return (
    <div ref={rootRef} className="geological-descent">
      <svg className="geological-descent-art" viewBox={`0 0 1440 ${total}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="descent-wrap-x">
            {[0, .15, .5, .85, 1].map((offset, i) => <stop key={i} offset={offset} stopColor="#fff" stopOpacity={[0, .2, 1, .2, 0][i]} />)}
          </linearGradient>
          <linearGradient id="descent-wrap-y" x1="0" y1="0" x2="0" y2="1" href="#descent-wrap-x" />
          <mask id="descent-wrap-mask-x" x="0" y="0" width="840" height="840" maskUnits="userSpaceOnUse"><rect width="840" height="840" fill="url(#descent-wrap-x)" /></mask>
          <mask id="descent-wrap-mask-y" x="0" y="0" width="840" height="840" maskUnits="userSpaceOnUse"><rect width="840" height="840" fill="url(#descent-wrap-y)" /></mask>
          {/* Shared origins keep texture continuous across beds of the same material. */}
          {[...new Set(materials)].map(material => (
            <React.Fragment key={material}>
              <pattern id={`descent-raw-${material}`} width="840" height="840" patternUnits="userSpaceOnUse">
                <image href={`./assets/geology-${material}.webp?v=2`} width="840" height="840" preserveAspectRatio="none" />
              </pattern>
              <pattern id={`descent-raw-${material}-x`} href={`#descent-raw-${material}`} patternTransform="translate(420 0)" />
              <pattern id={`descent-raw-${material}-y`} href={`#descent-raw-${material}`} patternTransform="translate(0 420)" />
              <pattern id={`descent-raw-${material}-xy`} href={`#descent-raw-${material}`} patternTransform="translate(420 420)" />
              {/* Each raw image edge is covered by its continuous half-tile offset. */}
              <pattern className="descent-material" id={`descent-rock-${material}`} width="840" height="840" patternUnits="userSpaceOnUse">
                <g className="descent-tile">
                  <rect width="840" height="840" fill={`url(#descent-raw-${material}-xy)`} />
                  <rect width="840" height="840" fill={`url(#descent-raw-${material}-y)`} mask="url(#descent-wrap-mask-x)" />
                  <g mask="url(#descent-wrap-mask-y)">
                    <rect width="840" height="840" fill={`url(#descent-raw-${material}-x)`} />
                    <rect width="840" height="840" fill={`url(#descent-raw-${material})`} mask="url(#descent-wrap-mask-x)" />
                  </g>
                </g>
              </pattern>
            </React.Fragment>
          ))}
          {beds.map((bed, i) => <clipPath key={i} id={`descent-bed-${i}`}><path d={bed} /></clipPath>)}
          <filter id="descent-mineral-grain">
            <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="19" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <pattern id="descent-grain" width="160" height="160" patternUnits="userSpaceOnUse">
            <rect width="160" height="160" filter="url(#descent-mineral-grain)" />
          </pattern>
          <linearGradient id="descent-bridge" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#070a0c" /><stop offset="1" stopColor="#070a0c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="descent-reading-veil">
            <stop stopColor="#080e12" stopOpacity=".12" /><stop offset=".2" stopColor="#080e12" stopOpacity=".32" />
            <stop offset=".8" stopColor="#080e12" stopOpacity=".32" /><stop offset="1" stopColor="#080e12" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <rect width="1440" height={total} fill="#151b1f" />
        {materials.map((material, i) => (
          <g key={i}>
            <path data-bed={i} d={beds[i]} fill={colors[material]} />
            <path className="descent-rock" data-material={material} d={beds[i]} fill={`url(#descent-rock-${material})`} />
            <path d={beds[i]} fill={colors[material]} opacity={.08 + random(i + 210) * .08} />
            <path d={beds[i]} fill="url(#descent-grain)" opacity={material === 'sandstone' || material === 'siltstone' ? '.09' : '.04'} />
            <g clipPath={`url(#descent-bed-${i})`} fill="none">
              {material !== 'basement' && (material === 'shale' ? [.12, .28, .43, .61, .76, .9] : [.24, .52, .78]).map(fraction => (
                <path key={fraction} d={trace(profiles[i].map(([x]) => {
                  const y = boundaryY(i, x) * (1 - fraction) + boundaryY(i + 1, x) * fraction;
                  const offset = faults.reduce((sum, fault) => {
                    const t = (y - fault.y) / fault.length;
                    return sum + (fault.bed === i && t > 0 && t < 1 && x > faultX(fault, y) ? fault.throw * Math.sin(Math.PI * t) : 0);
                  }, 0);
                  return [x, y + offset];
                }))} stroke={material === 'shale' ? '#a4aea8' : '#494b40'} strokeOpacity=".16" strokeWidth=".55" />
              ))}
              <path data-fractures={i} data-material={material} data-fracture-count={fracturedBeds.includes(i) && material !== 'basement' ? 18 : fractureCounts[material]}
                stroke={material === 'basement' ? '#382e2a' : '#3f4239'} strokeOpacity=".42" strokeWidth=".7"
                d={Array.from({ length: fracturedBeds.includes(i) && material !== 'basement' ? 18 : fractureCounts[material] }, (_, n) => {
                  const seed = i * 97 + n * 5;
                  const x = 12 + (n * 91 + random(seed) * 65) % 1416;
                  const top = boundaryY(i, x), bottom = boundaryY(i + 1, x);
                  const y = top + (random(seed + 1) * .84 + .06) * (bottom - top);
                  const length = 14 + random(seed + 2) * (material === 'basement' ? 62 : 32);
                  const lean = (n % 3 ? .64 : -.56) * length;
                  return `M${x} ${y}l${lean * .45} ${length * .48} ${lean * .55 + 2} ${length * .52}`
                    + (n % 3 === 0 ? `m${-lean * .55 - 3} ${-length * .52}l${-lean * .35} ${length * .3}` : '');
                }).join('')} />
              {(material === 'basement' || fracturedBeds.includes(i)) && <path stroke="#ddd3b9" strokeOpacity=".36" strokeWidth="1"
                d={Array.from({ length: material === 'basement' ? 12 : 3 }, (_, n) => {
                  const x = 35 + random(i * 37 + n * 11) * 1370;
                  const y = boundaryY(i, x) + (boundaryY(i + 1, x) - boundaryY(i, x)) * random(n * 17 + i);
                  return `M${x} ${y}l17 19 -7 11 23 24m-16 -35l-19 7`;
                }).join('')} />}
            </g>
          </g>
        ))}
        {profiles.slice(1, -1).map((points, i) => (
          <path key={i} data-contact={i + 1} d={trace(points)} fill="none"
            stroke="#a9a595" strokeOpacity={i === materials.length - 2 ? '.3' : '.1'} strokeWidth={i === materials.length - 2 ? 1 : .6} />
        ))}
        {faults.map((fault, i) => {
          const line = trace(Array.from({ length: 13 }, (_, n) => {
            const y = fault.y + fault.length * n / 12;
            return [faultX(fault, y) + Math.sin(n * 1.8 + i) * Math.min(1.2, fault.length * .015), y];
          }));
          return <g key={i} className="descent-fault" clipPath={`url(#descent-bed-${fault.bed})`}>
            <path data-fault={i} data-fault-material={materials[fault.bed]} d={line} fill="none" stroke="#42372e" strokeOpacity=".48" strokeWidth="1" />
            <path d={line} transform="translate(1.5 0)" fill="none" stroke="#b0a58e" strokeOpacity=".23" strokeWidth=".6" />
          </g>;
        })}
        {[sandstoneBed, lowerSandstone].map((bed, n) => (
          <g key={bed} className="descent-motion" data-visible="false" clipPath={`url(#descent-bed-${bed})`}>
            {[38, 1240].map(x => <React.Fragment key={x}>
              <path d={`M${x} ${middle(bed, x)}l108 -4`} fill="none" stroke="#aac5ca" strokeOpacity=".12" strokeWidth="1" />
              {[0, 1, 2].map(i => <ellipse key={i} className="descent-flow" cx={x} cy={middle(bed, x)} rx="3" ry="1.1"
                fill="#bad4d8" style={{ animationDelay: `${-i * 1.1 - n * 9}s` }} />)}
            </React.Fragment>)}
          </g>
        ))}
        <rect width="1440" height={total} fill="url(#descent-reading-veil)" />
        <rect width="1440" height="100" fill="url(#descent-bridge)" />
      </svg>
      {children}
    </div>
  );
};

Object.assign(window, { GeologicalDescent });
