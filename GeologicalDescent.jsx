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
        const tileWidth = 1440 * 1440 / width;
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
  const levels = [0, about * .10, about * .27, about * .34, about * .48, about * .54,
    about * .76, about * .91, about + research * .13, about + research * .34,
    about + research * .40, about + research * .63, about + research * .84,
    about + research + contact * .18, about + research + contact * .52, total];
  const materials = ['shale', 'sandstone', 'shale', 'limestone', 'shale', 'sandstone',
    'shale', 'sandstone', 'limestone', 'shale', 'limestone', 'sandstone', 'shale', 'limestone', 'basement'];
  const colors = { shale: '#23272a', sandstone: '#716557', limestone: '#73766e', basement: '#35424a' };
  const throwLimit = Math.min(...levels.slice(1).map((y, i) => y - levels[i])) * .65;
  const faults = currentGeology.faults.map((fault, i) => ({
    root: (fault.xPercent * 10 + fault.dipSlope * 580) * 1.44,
    direction: Math.sign(fault.dipSlope), throw: Math.min(i % 2 ? 38 : 44, throwLimit) * (i % 2 ? -1 : 1),
  }));
  const faultX = (fault, y) => fault.root + fault.direction * 26 * (1 - Math.exp(-y / 900));
  const boundaryY = (i, x) => {
    if (i === 0) return 0;
    if (i === levels.length - 1) return total;
    const y = levels[i];
    const roughness = 2.2 * Math.sin(x * .027 + i * .9) + 1.1 * Math.sin(x * .081 + i);
    const dip = (x - 720) * .018 + 15 * Math.sin(x / 600 + .7);
    const offset = faults.reduce((sum, fault) => sum + (x > faultX(fault, y) ? fault.throw : 0), 0);
    return y + Math.min(1, y / 160) * (dip + roughness + offset);
  };
  // Sample both sides of each fault so the same contacts bound adjoining beds.
  const profiles = levels.map((y, i) => {
    const xs = [...Array.from({ length: 61 }, (_, n) => n * 24),
      ...faults.flatMap(fault => [faultX(fault, y) - .4, faultX(fault, y) + .4])]
      .filter(x => x >= 0 && x <= 1440).sort((a, b) => a - b);
    return xs.map(x => [x, boundaryY(i, x)]);
  });
  const trace = points => 'M' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  const beds = profiles.slice(0, -1).map((points, i) => trace(points) + 'L' +
    [...profiles[i + 1]].reverse().map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z');
  const middle = (i, x) => (boundaryY(i, x) + boundaryY(i + 1, x)) / 2;
  const veinY = middle(8, 1310);
  const lensY = middle(6, 1260);
  const sensorY = about + research * .72;
  const inspections = [
    { before: AboutSection, rock: 'sandstone', label: 'Sandstone', title: 'Grains, beds & fluid pathways',
      text: 'Cemented sand grains and tilted cross-bedding give this interval its texture. The blue traces illustrate a fluid pathway through the bed.',
      y: middle(1, 1330), compact: 28, image: 'sandstone' },
    { before: PublicationsList, rock: 'limestone', label: 'Limestone', title: 'Shell fragments & calcite veins',
      text: 'Small fossil fragments sit within the carbonate matrix. Pale calcite veins record fractures that were filled by minerals.',
      y: middle(8, 1330), compact: about + 28, image: 'limestone' },
    { before: ContactSection, rock: 'fault', label: 'Monitoring', title: 'Faults & downhole monitoring',
      text: 'Beds are displaced across the fault zones. A small instrument in the observation borehole gives an occasional status pulse.',
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
              <pattern className="descent-material" id={`descent-rock-${i}`} width="1440" height="1440" x="0" y={levels[i] - (i * 137) % 850} patternUnits="userSpaceOnUse">
                <image href={`./assets/geology-${material}.webp`} width="1440" height="1440" preserveAspectRatio="none" />
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
          </g>
        ))}
        {profiles.slice(1, -1).map((points, i) => (
          <path key={i} data-contact={i + 1} d={trace(points)} fill="none"
            stroke={i === 13 ? '#c1baaa' : '#b4ae9d'} strokeOpacity={i === 13 ? '.45' : '.18'} strokeWidth={i === 13 ? 2 : 1} />
        ))}
        <g clipPath="url(#descent-bed-6)">
          <path d={`M1020 ${lensY}Q1180 ${lensY - 34} 1440 ${lensY - 10}L1440 ${lensY + 16}Q1190 ${lensY + 26} 1020 ${lensY}Z`}
            fill="url(#descent-rock-5)" opacity=".55" />
        </g>
        <g className="descent-vein" clipPath="url(#descent-bed-8)" fill="none" stroke="#c2c1ac" strokeOpacity=".42" strokeWidth="1.6">
          <path d={`M1280 ${veinY - 66}l14 23 -9 19 26 22 -4 27 33 25 -8 28M1311 ${veinY - 2}l30 -16 12 -25M1307 ${veinY + 25}l-26 9 -18 -7`} />
        </g>
        {faults.map((fault, i) => {
          const line = trace(Array.from({ length: 31 }, (_, n) => {
            const y = levels[14] * n / 30;
            return [faultX(fault, y), y];
          }));
          return <g key={i} className="descent-fault">
            <path d={line} fill="none" stroke="#141917" strokeOpacity=".7" strokeWidth="10" />
            <path d={line} fill="none" stroke="#a19784" strokeOpacity=".3" strokeWidth="1.3" />
          </g>;
        })}
        <path d={`M84 ${about + research * .48}V${about + research + contact * .18}`}
          fill="none" stroke="#0a1013" strokeWidth="6" />
        <path d={`M84 ${about + research * .48}V${about + research + contact * .18}`}
          fill="none" stroke="#859295" strokeOpacity=".38" strokeWidth="1.5" />
        <g className="descent-motion" data-visible="false">
          <rect x="79" y={sensorY - 9} width="10" height="18" rx="1" fill="#293438" stroke="#99a8a5" strokeWidth=".7" />
          <circle className="descent-sensor" cx="84" cy={sensorY} r="2" fill="#d2b27c" />
        </g>
        {[1, 11].map((bed, n) => (
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
