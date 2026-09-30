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
        pattern.querySelector('image').setAttribute('width', tileWidth);
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
    'shale', 'sandstone', 'sandstone', 'shale', 'limestone', 'shale', 'sandstone', 'limestone',
    'shale', 'shale', 'sandstone', 'limestone', 'limestone', 'shale', 'sandstone', 'sandstone',
    'shale', 'limestone', 'sandstone', 'shale', 'shale', 'limestone', 'sandstone', 'limestone',
    'shale', 'sandstone', 'sandstone', 'limestone', 'shale', 'limestone', 'shale', 'sandstone',
    'sandstone', 'shale', 'limestone', 'shale', 'limestone', 'sandstone', 'shale', 'sandstone', 'basement',
  ];
  const colors = { shale: '#29312f', sandstone: '#78674f', limestone: '#77796b', basement: '#39454a' };
  const random = seed => { const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const weights = materials.slice(0, -1).map((_, i) => .45 + random(i + 8) * 1.4);
  const basementLevel = about + research + contact * .42;
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const levels = [0];
  weights.forEach(weight => levels.push(levels[levels.length - 1] + weight / weightTotal * basementLevel));
  levels.push(total);
  // Local fault splays end within a few beds; nothing runs down the entire page.
  const faults = Array.from({ length: Math.ceil(basementLevel / 300) * 3 }, (_, i) => ({
    x: [105, 720, 1325][i % 3] + (random(i + 60) - .5) * 110,
    y: Math.floor(i / 3) * 300 + 35 + random(i + 80) * 100,
    length: 140 + random(i + 100) * 150,
    slope: (i % 2 ? -1 : 1) * (.45 + random(i + 120) * .45),
    throw: (i % 2 ? -1 : 1) * (8 + random(i + 140) * 9),
  }));
  const faultX = (fault, y) => fault.x + (y - fault.y - fault.length / 2) * fault.slope;
  // Positive, laterally varying thicknesses form wedges without crossing contacts.
  const columnProfiles = new Map();
  const baseBoundary = (i, x) => {
    if (i === 0) return 0;
    if (i === levels.length - 1) return total;
    if (columnProfiles.has(x)) return columnProfiles.get(x)[i];
    const thicknesses = weights.map((weight, n) => weight * Math.max(.12,
      1 + .64 * Math.sin(x / 210 + n * .72) + .28 * Math.cos(x / 115 - n * .46)));
    const thicknessTotal = thicknesses.reduce((sum, weight) => sum + weight, 0);
    const erosion = 44 * Math.sin(x / 190 + .8) + 18 * Math.sin(x / 77) + 5 * Math.sin(x / 23);
    const fold = 52 * Math.sin(x / 400 + .45) + 18 * Math.cos(x / 190);
    let cumulative = 0;
    const column = [0, ...thicknesses.map((weight, n) => {
      cumulative += weight;
      const fraction = .24 * cumulative / thicknessTotal + .76 * levels[n + 1] / basementLevel;
      return fraction * (basementLevel + erosion) + Math.sin(Math.PI * fraction) * fold
        + Math.sin(Math.PI * fraction) * (2 * Math.sin(x / 11 + n + 1) + Math.sin(x / 4.7));
    }), total];
    columnProfiles.set(x, column);
    return column[i];
  };
  const boundaryY = (i, x) => {
    if (i === 0) return 0;
    if (i === levels.length - 1) return total;
    const y = baseBoundary(i, x);
    const clearance = Math.min(y - baseBoundary(i - 1, x), baseBoundary(i + 1, x) - y) * .28;
    const offset = faults.reduce((sum, fault) => {
      const t = (y - fault.y) / fault.length;
      return sum + (t > 0 && t < 1 && x > faultX(fault, y) ? fault.throw * Math.sin(Math.PI * t) : 0);
    }, 0);
    return y + Math.max(-clearance, Math.min(clearance, offset));
  };
  // Sample both sides of each fault so the same contacts bound adjoining beds.
  const profiles = levels.map((y, i) => {
    const xs = [...Array.from({ length: 121 }, (_, n) => n * 12),
      ...faults.flatMap(fault => {
        let x = faultX(fault, y);
        for (let n = 0; n < 8; n++) x = faultX(fault, baseBoundary(i, x));
        const depth = baseBoundary(i, x);
        return depth > fault.y && depth < fault.y + fault.length ? [x - .3, x + .3] : [];
      })]
      .filter(x => x >= 0 && x <= 1440).sort((a, b) => a - b);
    return xs.map(x => [x, boundaryY(i, x)]);
  });
  const trace = points => 'M' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  const beds = profiles.slice(0, -1).map((points, i) => trace(points) + 'L' +
    [...profiles[i + 1]].reverse().map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z');
  const middle = (i, x) => (boundaryY(i, x) + boundaryY(i + 1, x)) / 2;
  const bedAt = (material, y) => materials.reduce((best, rock, i) =>
    rock === material && Math.abs(levels[i] - y) < Math.abs(levels[best] - y) ? i : best, materials.indexOf(material));
  const sandstoneBed = bedAt('sandstone', about * .22);
  const limestoneBed = bedAt('limestone', about + research * .12);
  const lowerSandstone = bedAt('sandstone', about + research * .68);
  const sensorY = about + research * .72;
  const inspections = [
    { before: AboutSection, rock: 'sandstone', label: 'Sandstone', title: 'Grains, beds & fluid pathways',
      text: 'Cemented sand grains and tilted cross-bedding give this interval its texture. The blue traces illustrate a fluid pathway through the bed.',
      y: middle(sandstoneBed, 1330), compact: 28, image: 'sandstone' },
    { before: PublicationsList, rock: 'limestone', label: 'Limestone', title: 'Shell fragments & calcite veins',
      text: 'Small fossil fragments sit within the carbonate matrix. Pale calcite veins record fractures that were filled by minerals.',
      y: middle(limestoneBed, 1330), compact: about + 28, image: 'limestone' },
    { before: ContactSection, rock: 'fault', label: 'Monitoring', title: 'Faults & downhole monitoring',
      text: 'Small inclined fault splays offset a few beds at a time. Fine joints and mineral-filled fractures sit between them. A downhole instrument gives an occasional status pulse.',
      y: sensorY, compact: about + research - 70, image: 'shale' },
    { before: Footer, rock: 'basement', label: 'Basement', title: 'Crystalline basement',
      text: 'The sedimentary sequence ends at an irregular eroded surface. Beneath it, interlocking minerals and quartz veins form the crystalline basement.',
      y: about + research + contact * .73, compact: about + research + contact + 14, image: 'basement' },
  ];

  return (
    <div ref={rootRef} className="geological-descent">
      <svg className="geological-descent-art" viewBox={`0 0 1440 ${total}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          {materials.map((material, i) => (
            <React.Fragment key={i}>
              <pattern className="descent-material" id={`descent-rock-${i}`} width="840" height="840" x={-(i * 71) % 840} y={levels[i] - (i * 137) % 840} patternUnits="userSpaceOnUse">
                <image href={`./assets/geology-${material}.webp`} width="840" height="840" preserveAspectRatio="none" />
              </pattern>
              <clipPath id={`descent-bed-${i}`}><path d={beds[i]} /></clipPath>
            </React.Fragment>
          ))}
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
            <path className="descent-rock" data-material={material} d={beds[i]} fill={`url(#descent-rock-${i})`} />
            <g clipPath={`url(#descent-bed-${i})`} fill="none">
              {material !== 'basement' && [.24, .52, .78].map(fraction => (
                <path key={fraction} d={trace(profiles[i].map(([x]) => [x,
                  boundaryY(i, x) * (1 - fraction) + boundaryY(i + 1, x) * fraction]))}
                  stroke={material === 'shale' ? '#b1b4a7' : '#36382f'} strokeOpacity=".22" strokeWidth=".65" />
              ))}
              <path data-fractures={i} stroke={material === 'shale' ? '#bcc1ad' : '#222d2b'} strokeOpacity=".4" strokeWidth=".8"
                d={Array.from({ length: material === 'basement' ? 70 : 8 }, (_, n) => {
                  const seed = i * 97 + n * 5;
                  const x = n % 3 === 0 ? 25 + random(seed) * 140 : n % 3 === 1 ? 1250 + random(seed) * 160 : 240 + random(seed) * 940;
                  const top = boundaryY(i, x), bottom = boundaryY(i + 1, x);
                  const y = top + random(seed + 1) * (bottom - top);
                  const length = 16 + random(seed + 2) * 48;
                  const lean = (n % 2 ? -1 : 1) * length * (.4 + random(seed + 3) * .5);
                  return `M${x} ${y}l${lean * .45} ${length * .48} ${lean * .55 + 3} ${length * .52}`
                    + (n % 3 === 0 ? `m${-lean * .55 - 3} ${-length * .52}l${-lean * .35} ${length * .3}` : '');
                }).join('')} />
              {material === 'limestone' && <path stroke="#d2cbb8" strokeOpacity=".42" strokeWidth="1.1"
                d={`M1285 ${middle(i, 1285) - 18}l18 9 -6 14 23 17 19 -5m-42 -15l-17 8 -13 -3`} />}
            </g>
            {material === 'shale' && i % 3 === 0 && <g clipPath={`url(#descent-bed-${i})`}>
              {[90, 1320].map(x => {
                const y = middle(i, x);
                return <path key={x} d={`M${x - 145} ${y}Q${x} ${y - 30} ${x + 170} ${y + 6}Q${x} ${y + 23} ${x - 145} ${y}Z`}
                  fill={`url(#descent-rock-${sandstoneBed})`} opacity=".65" />;
              })}
            </g>}
          </g>
        ))}
        {profiles.slice(1, -1).map((points, i) => (
          <path key={i} data-contact={i + 1} d={trace(points)} fill="none"
            stroke="#b4ae9d" strokeOpacity={i === materials.length - 2 ? '.42' : '.2'} strokeWidth={i === materials.length - 2 ? 1.5 : .8} />
        ))}
        <g clipPath={`url(#descent-bed-${materials.length - 1})`} fill="none" stroke="#a9afa0" strokeOpacity=".17" strokeWidth="1">
          {Array.from({ length: Math.ceil((total - basementLevel) / 65) + 10 }, (_, i) => (
            <path key={i} d={`M-120 ${basementLevel - 340 + i * 65}l1680 540`} />
          ))}
          <path d={`M1250 ${basementLevel - 80}l-32 84 16 26 -29 59 11 45 -25 56 9 25 -22 85m27 -141l42 24 19 31`}
            stroke="#c5c4b3" strokeOpacity=".35" strokeWidth="2" />
        </g>
        {faults.map((fault, i) => {
          const line = trace(Array.from({ length: 13 }, (_, n) => {
            const y = fault.y + fault.length * n / 12;
            return [faultX(fault, y) + Math.sin(n * 1.8 + i) * 1.2, y];
          }));
          return <g key={i} className="descent-fault">
            <path data-fault={i} d={line} fill="none" stroke="#25302d" strokeOpacity=".5" strokeWidth="1.2" />
            <path d={line} transform="translate(1.5 0)" fill="none" stroke="#b0a58e" strokeOpacity=".23" strokeWidth=".6" />
          </g>;
        })}
        <path d={`M84 ${sensorY - 80}V${sensorY + 42}`} fill="none" stroke="#9ba6a0" strokeOpacity=".38" strokeWidth="1" />
        <g className="descent-motion" data-visible="false">
          <rect x="79" y={sensorY - 9} width="10" height="18" rx="1" fill="#293438" stroke="#99a8a5" strokeWidth=".7" />
          <circle className="descent-sensor" cx="84" cy={sensorY} r="2" fill="#d2b27c" />
        </g>
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
      {React.Children.map(children, child => <React.Fragment>
      {inspections.filter(item => item.before === child?.type).map(item => (
        <details key={item.rock} className="descent-inspection" data-rock={item.rock}
          style={{ '--inspection-y': `${item.y}px`, '--inspection-compact-y': `${item.compact}px` }}>
          <summary aria-label={`Inspect ${item.label.toLowerCase()}`}>
            <span className="descent-inspection-target" aria-hidden="true">+</span>
            <span>{item.label}</span>
          </summary>
          <div className="descent-inspection-card">
            <img src={`./assets/geology-${item.image}.webp`} alt="" loading="lazy" decoding="async" width="260" height="72" />
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        </details>
      ))}
      {child}
      </React.Fragment>)}
    </div>
  );
};

Object.assign(window, { GeologicalDescent });
