// One cross-section behind the home content, from the hero's aquifer to the footer.
const GeologicalDescent = ({ children }) => {
  const rootRef = React.useRef(null);
  const [heights, setHeights] = React.useState([1100, 1500, 850, 240]);

  React.useEffect(() => {
    const sections = [...rootRef.current.querySelectorAll('.section-panel'), rootRef.current.querySelector('footer')];
    const measure = () => {
      const next = sections.map(section => Math.round(section.offsetHeight));
      setHeights(previous => next.some((height, i) => height !== previous[i]) ? next : previous);
    };
    const observer = new ResizeObserver(measure);
    sections.forEach(section => observer.observe(section));
    measure();
    return () => observer.disconnect();
  }, []);

  const [aboutHeight, researchHeight, contactHeight, footerHeight] = heights;
  const basementTop = aboutHeight - 70;
  const mantleTop = aboutHeight + researchHeight - 85;
  const totalHeight = aboutHeight + researchHeight + contactHeight + footerHeight;
  const points = (y, amplitude = 0, phase = 0) => Array.from({ length: 41 }, (_, i) => {
    const x = i * 36;
    const bend = Math.sin(x / 185 + phase) + 0.32 * Math.sin(x / 61 + phase * 0.7);
    return [x, y + amplitude * bend];
  });
  const trace = (y, amplitude, phase) => 'M' + points(y, amplitude, phase).map(([x, py]) => `${x} ${py.toFixed(1)}`).join('L');
  const bed = (top, bottom, topBend, bottomBend, phase = 0) =>
    trace(top, topBend, phase) + 'L' + points(bottom, bottomBend, phase + 0.3).reverse().map(([x, y]) => `${x} ${y.toFixed(1)}`).join('L') + 'Z';
  const below = (y, bend, phase) => trace(y, bend, phase) + `L1440 ${totalHeight}L0 ${totalHeight}Z`;
  const faultRoots = currentGeology.faults.map(fault =>
    (fault.xPercent * 10 + fault.dipSlope * 580) * 1.44);

  return (
    <div ref={rootRef} className="geological-descent">
      <svg className="geological-descent-art" viewBox={`0 0 1440 ${totalHeight}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="descent-grain" width="83" height="57" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="11" r="1" fill="#c3d4d8" opacity=".16" />
            <circle cx="64" cy="39" r=".7" fill="#c3d4d8" opacity=".15" />
            <path d="M29 33l8 -1M67 8l5 1M9 49l4 -1" stroke="#b5c8cb" strokeWidth=".7" opacity=".16" />
          </pattern>
          <pattern id="descent-foliation" width="110" height="45" patternUnits="userSpaceOnUse" patternTransform="rotate(-13)">
            <path d="M0 9h110M0 28h110" stroke="#adb3c6" strokeWidth=".8" opacity=".12" />
          </pattern>
          <linearGradient id="descent-heat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#342a2c" />
            <stop offset="1" stopColor="#3b292b" />
          </linearGradient>
        </defs>

        {/* Sedimentary beds continue the hero's dark aquifer; thickness varies across x. */}
        <rect width="1440" height={totalHeight} fill="#1c252d" />
        <path d={bed(0, aboutHeight * .17, 0, 16, .4)} fill="#202d37" />
        <path d={bed(aboutHeight * .17, aboutHeight * .36, 16, 26, .7)} fill="#26333d" />
        <path d={bed(aboutHeight * .36, aboutHeight * .56, 26, 20, 1.1)} fill="#1d2c35" />
        <path d={bed(aboutHeight * .56, aboutHeight * .79, 20, 35, 1.5)} fill="#29343a" />
        <path d={below(aboutHeight * .79, 35, 1.8)} fill="#252b34" />
        {[.10, .17, .26, .36, .47, .56, .67, .79].map((fraction, i) => (
          <path key={i} d={trace(aboutHeight * fraction, 9 + i * 2.8, .4 + i * .25)} fill="none"
            stroke={i % 3 === 1 ? '#9baeb4' : '#6f8993'} strokeOpacity={i % 3 === 1 ? '.24' : '.16'} strokeWidth="1.2" />
        ))}
        <path d={`M1190 ${aboutHeight * .94}C1200 ${aboutHeight * .73} 1280 ${aboutHeight * .51} 1350 ${aboutHeight * .55}C1420 ${aboutHeight * .58} 1450 ${aboutHeight * .81} 1480 ${aboutHeight * .96}Z`}
          fill="#aab4b0" fillOpacity=".18" stroke="#c2c6b5" strokeOpacity=".42" strokeWidth="2" />
        <path d={`M1235 ${aboutHeight * .91}C1260 ${aboutHeight * .71} 1305 ${aboutHeight * .60} 1350 ${aboutHeight * .63}`}
          fill="none" stroke="#d0d0be" strokeOpacity=".25" strokeWidth="2" />
        <rect width="1440" height={aboutHeight} fill="url(#descent-grain)" />
        {faultRoots.map((x, i) => (
          <path key={i} d={`M${x.toFixed(1)} 0C${(x + 26).toFixed(1)} ${aboutHeight * .19} ${(x + 55).toFixed(1)} ${aboutHeight * .38} ${(x + 42).toFixed(1)} ${aboutHeight * .57}`}
            fill="none" stroke="#9ab0b4" strokeOpacity=".18" strokeWidth="2" />
        ))}

        {/* Eroded unconformity exposes folded crystalline basement. */}
        <path d={below(basementTop, 44, 2.1)} fill="#1b2130" />
        <path d={trace(basementTop, 44, 2.1)} fill="none" stroke="#a7a9a4" strokeOpacity=".46" strokeWidth="3" />
        <path d={bed(aboutHeight + researchHeight * .12, aboutHeight + researchHeight * .38, 29, 48, .9)} fill="#25283b" />
        <path d={bed(aboutHeight + researchHeight * .38, aboutHeight + researchHeight * .67, 48, 33, 1.3)} fill="#2b2b3e" />
        <path d={below(aboutHeight + researchHeight * .67, 33, 1.7)} fill="#252734" />
        {[.06, .15, .25, .38, .49, .57, .67, .78].map((fraction, i) => (
          <path key={i} d={trace(aboutHeight + researchHeight * fraction, 16 + (i % 3) * 12, .8 + i * .27)}
            fill="none" stroke="#b4b5c1" strokeOpacity={i % 3 === 0 ? '.22' : '.12'} strokeWidth={i % 3 === 0 ? 2 : 1} />
        ))}
        <path d={`M45 ${aboutHeight + 90}C70 ${aboutHeight + researchHeight * .3} 130 ${aboutHeight + researchHeight * .47} 210 ${aboutHeight + researchHeight * .72}`}
          fill="none" stroke="#c8d0ce" strokeOpacity=".28" strokeWidth="5" />
        <path d={`M1390 ${aboutHeight + researchHeight * .1}C1340 ${aboutHeight + researchHeight * .32} 1380 ${aboutHeight + researchHeight * .52} 1220 ${aboutHeight + researchHeight * .76}`}
          fill="none" stroke="#c8d0ce" strokeOpacity=".22" strokeWidth="3" />
        <rect y={aboutHeight} width="1440" height={researchHeight} fill="url(#descent-foliation)" />

        {/* The Moho leads into dark, granular upper mantle; the footer stays here. */}
        <path d={below(mantleTop, 31, 1.4)} fill="url(#descent-heat)" />
        <path d={trace(mantleTop, 31, 1.4)} fill="none" stroke="#b78e78" strokeOpacity=".52" strokeWidth="3" />
        {[.16, .35, .56, .76].map((fraction, i) => (
          <path key={i} d={trace(aboutHeight + researchHeight + contactHeight * fraction, 15 + i * 6, 1.8 + i * .34)}
            fill="none" stroke="#b98773" strokeOpacity={i === 0 ? '.25' : '.14'} strokeWidth="1.5" />
        ))}
        <rect y={aboutHeight + researchHeight} width="1440" height={contactHeight + footerHeight} fill="url(#descent-grain)" />
      </svg>
      {children}
    </div>
  );
};

Object.assign(window, { GeologicalDescent });
