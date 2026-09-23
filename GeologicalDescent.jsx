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
  const basementTop = aboutHeight + 75;
  const mantleTop = aboutHeight + researchHeight + 65;
  const totalHeight = aboutHeight + researchHeight + contactHeight + footerHeight;
  const sedimentLevels = [0, .05, .12, .24, .30, .42, .50, .60, .65, .75, .84];
  const sedimentBends = [0, 8, 14, 22, 17, 26, 19, 29, 23, 31, 36];
  const sedimentColors = [
    'url(#descent-aquifer-bridge)', '#19282f', '#263840', '#35454a', '#343d40',
    '#2b3b40', '#424643', '#303a3e', '#494840', '#33383c',
  ];
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
          <pattern id="descent-lamina" width="110" height="28" patternUnits="userSpaceOnUse">
            <path d="M0 5Q30 2 58 5T110 4M0 19Q35 22 65 18T110 19" fill="none" stroke="#c0c9c5" strokeOpacity=".13" strokeWidth=".7" />
          </pattern>
          <pattern id="descent-foliation" width="110" height="45" patternUnits="userSpaceOnUse" patternTransform="rotate(-13)">
            <path d="M0 9h110M0 28h110" stroke="#adb3c6" strokeWidth=".8" opacity=".12" />
          </pattern>
          <pattern id="descent-peridotite" width="72" height="62" patternUnits="userSpaceOnUse">
            <ellipse cx="13" cy="17" rx="6" ry="3" fill="#9d9b75" opacity=".11" />
            <ellipse cx="52" cy="43" rx="3" ry="5" fill="#b08d74" opacity=".11" />
            <path d="M31 7l5 3m-11 39l7 -2" stroke="#c2ab92" strokeOpacity=".12" strokeWidth="1" />
          </pattern>
          <linearGradient id="descent-heat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#302c2b" />
            <stop offset="1" stopColor="#3b302d" />
          </linearGradient>
          <linearGradient id="descent-aquifer-bridge" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={aboutHeight * .05}>
            <stop offset="0" stopColor="#070a0c" />
            <stop offset=".52" stopColor="#111b20" />
            <stop offset="1" stopColor="#19282f" />
          </linearGradient>
        </defs>

        {/* The first pixels match the hero's deepest bed; new lithologies emerge below it. */}
        <rect width="1440" height={totalHeight} fill="#070a0c" />
        {sedimentColors.map((fill, i) => (
          <path key={i} d={bed(aboutHeight * sedimentLevels[i], aboutHeight * sedimentLevels[i + 1],
            sedimentBends[i], sedimentBends[i + 1], .4 + i * .3)} fill={fill} />
        ))}
        <path d={below(aboutHeight * .84, 36, 3.4)} fill="#30343a" />
        {sedimentLevels.slice(1).map((fraction, i) => (
          <path key={i} d={trace(aboutHeight * fraction, sedimentBends[i + 1], .7 + i * .3)} fill="none"
            stroke={i % 3 === 0 ? '#c4c2b4' : '#8da6aa'} strokeOpacity={i % 3 === 0 ? '.37' : '.22'} strokeWidth={i % 3 === 0 ? 1.8 : 1.1} />
        ))}
        {[.009, .018, .028, .038, .048, .060, .074].map((fraction, i) => (
          <path key={i} d={trace(aboutHeight * fraction, 2 + i, .25 + i * .12)}
            fill="none" stroke="#879a9a" strokeOpacity={.13 + i * .02} strokeWidth=".8" />
        ))}
        {[.20, .23, .37, .39, .54, .57, .69, .72].map((fraction, i) => (
          <path key={i} d={trace(aboutHeight * fraction, 10 + i * 1.4, 1.1 + i * .19)}
            fill="none" stroke="#aec0bd" strokeOpacity=".12" strokeWidth=".8" />
        ))}
        <rect y={aboutHeight * .1} width="1440" height={aboutHeight * .78} fill="url(#descent-lamina)" opacity=".7" />
        <path d={`M1190 ${aboutHeight * .94}C1200 ${aboutHeight * .73} 1280 ${aboutHeight * .51} 1350 ${aboutHeight * .55}C1420 ${aboutHeight * .58} 1450 ${aboutHeight * .81} 1480 ${aboutHeight * .96}Z`}
          fill="#aab4b0" fillOpacity=".18" stroke="#c2c6b5" strokeOpacity=".42" strokeWidth="2" />
        <path d={`M1235 ${aboutHeight * .91}C1260 ${aboutHeight * .71} 1305 ${aboutHeight * .60} 1350 ${aboutHeight * .63}`}
          fill="none" stroke="#d0d0be" strokeOpacity=".25" strokeWidth="2" />
        <rect y={aboutHeight * .08} width="1440" height={aboutHeight * .92} fill="url(#descent-grain)" />
        {faultRoots.map((x, i) => (
          <path key={i} d={`M${x.toFixed(1)} 0C${(x + 26).toFixed(1)} ${aboutHeight * .19} ${(x + 55).toFixed(1)} ${aboutHeight * .38} ${(x + 42).toFixed(1)} ${aboutHeight * .57}`}
            fill="none" stroke="#9ab0b4" strokeOpacity=".18" strokeWidth="2" />
        ))}

        {/* Eroded unconformity exposes folded crystalline basement. */}
        <path d={below(basementTop, 44, 2.1)} fill="#202936" />
        <path d={trace(basementTop, 44, 2.1)} fill="none" stroke="#b9b6a8" strokeOpacity=".57" strokeWidth="3" />
        <path d={bed(aboutHeight + researchHeight * .15, aboutHeight + researchHeight * .30, 29, 38, .9)} fill="#2c3744" />
        <path d={bed(aboutHeight + researchHeight * .30, aboutHeight + researchHeight * .43, 38, 48, 1.2)} fill="#3b3d49" />
        <path d={bed(aboutHeight + researchHeight * .43, aboutHeight + researchHeight * .58, 48, 37, 1.5)} fill="#2d3442" />
        <path d={bed(aboutHeight + researchHeight * .58, aboutHeight + researchHeight * .70, 37, 32, 1.8)} fill="#383943" />
        <path d={below(aboutHeight + researchHeight * .70, 32, 2.1)} fill="#292d39" />
        {[.10, .15, .22, .30, .36, .43, .51, .58, .64, .70, .78].map((fraction, i) => (
          <path key={i} d={trace(aboutHeight + researchHeight * fraction, 20 + (i % 4) * 9, .8 + i * .29)}
            fill="none" stroke={i % 4 === 2 ? '#d0c6b8' : '#a9b5bf'}
            strokeOpacity={i % 4 === 2 ? '.31' : '.18'} strokeWidth={i % 4 === 2 ? 2 : 1} />
        ))}
        <path d={`M45 ${aboutHeight + 90}C70 ${aboutHeight + researchHeight * .3} 130 ${aboutHeight + researchHeight * .47} 210 ${aboutHeight + researchHeight * .72}`}
          fill="none" stroke="#c8d0ce" strokeOpacity=".28" strokeWidth="5" />
        <path d={`M1390 ${aboutHeight + researchHeight * .1}C1340 ${aboutHeight + researchHeight * .32} 1380 ${aboutHeight + researchHeight * .52} 1220 ${aboutHeight + researchHeight * .76}`}
          fill="none" stroke="#c8d0ce" strokeOpacity=".22" strokeWidth="3" />
        <rect y={aboutHeight} width="1440" height={researchHeight} fill="url(#descent-foliation)" />

        {/* The Moho leads into dark, granular upper mantle; the footer stays here. */}
        <path d={below(mantleTop, 31, 1.4)} fill="url(#descent-heat)" />
        <path d={trace(mantleTop, 31, 1.4)} fill="none" stroke="#b99a80" strokeOpacity=".6" strokeWidth="3" />
        <path d={bed(mantleTop + contactHeight * .13, mantleTop + contactHeight * .31, 17, 28, .9)} fill="#3a3631" />
        <path d={bed(mantleTop + contactHeight * .31, mantleTop + contactHeight * .55, 28, 24, 1.2)} fill="#403932" />
        <path d={below(mantleTop + contactHeight * .55, 24, 1.5)} fill="#382f2d" />
        {[.10, .24, .37, .49, .64, .79].map((fraction, i) => (
          <path key={i} d={trace(aboutHeight + researchHeight + contactHeight * fraction, 15 + i * 4, 1.8 + i * .34)}
            fill="none" stroke={i % 2 ? '#b4a789' : '#b98773'} strokeOpacity={i % 2 ? '.26' : '.18'} strokeWidth="1.3" />
        ))}
        <rect y={aboutHeight + researchHeight} width="1440" height={contactHeight + footerHeight} fill="url(#descent-peridotite)" />
      </svg>
      {children}
    </div>
  );
};

Object.assign(window, { GeologicalDescent });
