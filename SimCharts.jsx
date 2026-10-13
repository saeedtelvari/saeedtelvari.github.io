// SimCharts.jsx — SVG charts for the CO2 simulator: inventory through time and the
// uncertainty histogram, tornado and run scatter. Colours come from CSS tokens.

const simNiceStep = (span, target) => {
  const raw = span / Math.max(1, target);
  const power = 10 ** Math.floor(Math.log10(raw || 1));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
};

const simTicks = (min, max, target = 4) => {
  const step = simNiceStep(max - min, target);
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(+v.toPrecision(12));
  return ticks;
};

// Measure the chart container so SVG text is drawn at its real pixel size.
const simUseWidth = fallback => {
  const [element, setElement] = useState(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    if (!element) return undefined;
    const update = () => setWidth(Math.max(220, Math.round(element.clientWidth) || fallback));
    update();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [element]);
  return [setElement, width];
};

const simUseHover = () => {
  const [hover, setHover] = useState(null);
  const onMove = (event, width, height) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHover({ x: (event.clientX - rect.left) * width / rect.width, y: (event.clientY - rect.top) * height / rect.height, px: event.clientX - rect.left, py: event.clientY - rect.top, rectWidth: rect.width });
  };
  return [hover, onMove, () => setHover(null)];
};

// Stacked area of the six inventory classes with the injected total as a dashed line:
// the top of the stack meeting the dashed line is the visible mass balance.
const SimInventoryChart = ({ history, year, years, injYears, onSeek }) => {
  const [chartRef, W] = simUseWidth(300);
  const H = 176;
  const m = { left: 34, right: 8, top: 8, bottom: 22 };
  const [hover, onMove, onLeave] = simUseHover();
  const geometry = useMemo(() => {
    if (!history || history.length < 2) return null;
    const maxMass = Math.max(1, ...history.map(row => row.injected)) / 1e9;
    const yTicks = simTicks(0, maxMass, 3);
    const top = Math.max(maxMass, yTicks.at(-1));
    const x = t => m.left + (W - m.left - m.right) * t / years;
    const y = mass => H - m.bottom - (H - m.top - m.bottom) * mass / top;
    const stride = Math.max(1, Math.ceil(history.length / 260));
    const rows = history.filter((_, i) => i % stride === 0 || i === history.length - 1);
    const layers = [];
    const base = rows.map(() => 0);
    for (const item of SIM_INVENTORY) {
      const upper = rows.map((row, i) => base[i] + row[item.key] / 1e9);
      const path = `M${rows.map((row, i) => `${x(row.year).toFixed(1)},${y(upper[i]).toFixed(1)}`).join('L')}` +
        `L${rows.slice().reverse().map((row, k) => { const i = rows.length - 1 - k; return `${x(row.year).toFixed(1)},${y(base[i]).toFixed(1)}`; }).join('L')}Z`;
      layers.push({ ...item, path });
      upper.forEach((value, i) => { base[i] = value; });
    }
    const injected = `M${rows.map(row => `${x(row.year).toFixed(1)},${y(row.injected / 1e9).toFixed(1)}`).join('L')}`;
    return { layers, injected, x, y, yTicks, top };
  }, [history, years, W]);

  if (!geometry) return <div className="sim-field__hint" ref={chartRef}>The chart appears as the run progresses.</div>;
  const { layers, injected, x, y, yTicks } = geometry;
  const hoverYear = hover ? Math.max(0, Math.min(history.at(-1).year, Math.round((hover.x - m.left) / (W - m.left - m.right) * years))) : null;
  const hoverRow = hoverYear !== null ? history[Math.min(history.length - 1, hoverYear)] : null;
  const xTicks = [0, Math.round(years / 2), years];
  return (
    <div className="sim-chart" ref={chartRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Stacked CO₂ inventory in megatonnes through time, with the injected total as a dashed line"
        onPointerMove={event => onMove(event, W, H)} onPointerLeave={onLeave}
        onClick={() => hoverYear !== null && onSeek(hoverYear)} style={{ cursor: 'crosshair' }}>
        {yTicks.map(t => <g key={t}><line className="sim-chart__grid" x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} /><text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
        <text x={4} y={m.top + 4}>Mt</text>
        <rect x={x(0)} y={m.top} width={x(injYears) - x(0)} height={H - m.top - m.bottom} fill="var(--sim-accent-soft)" />
        {layers.map(layer => <path key={layer.key} d={layer.path} fill={`var(${layer.color})`} stroke="var(--sim-surface)" strokeWidth="0.75" />)}
        <path className="sim-chart__injected" d={injected} />
        <line className="sim-chart__axis" x1={m.left} x2={W - m.right} y1={H - m.bottom} y2={H - m.bottom} />
        {xTicks.map(t => <text key={t} x={x(t)} y={H - 6} textAnchor={t === 0 ? 'start' : t === years ? 'end' : 'middle'}>{t === years ? `${t} yr` : t}</text>)}
        <line className="sim-chart__cursor" x1={x(year)} x2={x(year)} y1={m.top} y2={H - m.bottom} />
        {hoverRow && <line x1={x(hoverRow.year)} x2={x(hoverRow.year)} y1={m.top} y2={H - m.bottom} stroke="var(--sim-ink-muted)" strokeDasharray="2 2" />}
      </svg>
      {hoverRow && (
        <div className="sim-tooltip" style={{ left: Math.min(hover.px + 12, hover.rectWidth - 180), top: 4 }}>
          <strong>Year {hoverRow.year}</strong>
          {SIM_INVENTORY.slice().reverse().map(item => (
            <div key={item.key}><span className="sim-swatch" style={{ '--swatch': `var(${item.color})` }} /><span>{item.label}</span><span>{simFormatMass(hoverRow[item.key])}</span></div>
          ))}
          <div><span className="sim-swatch sim-swatch--dash" style={{ '--swatch': 'var(--sim-ink)' }} /><span>Injected</span><span>{simFormatMass(hoverRow.injected)}</span></div>
        </div>
      )}
      <details className="sim-table-toggle">
        <summary>Show as a table</summary>
        <table className="sim-table">
          <thead><tr><th>Year</th>{SIM_INVENTORY.map(item => <th key={item.key} title={item.label}>{item.label.split(' ')[0]}</th>)}</tr></thead>
          <tbody>
            {history.filter(row => row.year % Math.max(50, Math.round(years / 10)) === 0).map(row => (
              <tr key={row.year}><td>{row.year}</td>{SIM_INVENTORY.map(item => <td key={item.key}>{(row[item.key] / 1e9).toFixed(2)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};

const SimHistogram = ({ values, unit, digits }) => {
  const [chartRef, W] = simUseWidth(420);
  const H = 210;
  const m = { left: 36, right: 10, top: 18, bottom: 30 };
  const sorted = values.slice().sort((a, b) => a - b);
  const lo = sorted[0];
  const hi = sorted.at(-1);
  const span = hi - lo || Math.max(1, Math.abs(hi) * 0.1);
  const binCount = Math.max(5, Math.min(24, Math.round(Math.sqrt(values.length) * 1.5)));
  const width = span / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({ from: lo + i * width, count: 0 }));
  for (const v of values) bins[Math.min(binCount - 1, Math.floor((v - lo) / width))].count++;
  const maxCount = Math.max(...bins.map(b => b.count));
  const x = v => m.left + (W - m.left - m.right) * (v - lo) / (binCount * width);
  const y = c => H - m.bottom - (H - m.top - m.bottom) * c / maxCount;
  const marks = [['P10', 0.1], ['P50', 0.5], ['P90', 0.9]].map(([label, p]) => ({ label, value: simPercentile(sorted, p) }));
  return (
    <div className="sim-chart" ref={chartRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Histogram of ${values.length} runs with P10 ${simFormatNumber(marks[0].value, digits)}, P50 ${simFormatNumber(marks[1].value, digits)} and P90 ${simFormatNumber(marks[2].value, digits)} ${unit}`}>
        {simTicks(0, maxCount, 3).map(t => <g key={t}><line className="sim-chart__grid" x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} /><text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
        {bins.map((bin, i) => bin.count > 0 && (
          <rect key={i} x={x(bin.from) + 1} y={y(bin.count)} width={Math.max(1, x(bin.from + width) - x(bin.from) - 2)} height={H - m.bottom - y(bin.count)} rx="2" fill="var(--sim-c-free)" />
        ))}
        {marks.map(mark => (
          <g key={mark.label}>
            <line x1={x(mark.value)} x2={x(mark.value)} y1={m.top - 4} y2={H - m.bottom} stroke="var(--sim-ink)" strokeWidth="1.5" strokeDasharray={mark.label === 'P50' ? undefined : '3 3'} />
            <text x={x(mark.value)} y={m.top - 7} textAnchor="middle" style={{ fill: 'var(--sim-ink)' }}>{mark.label}</text>
          </g>
        ))}
        <line className="sim-chart__axis" x1={m.left} x2={W - m.right} y1={H - m.bottom} y2={H - m.bottom} />
        <text x={m.left} y={H - 10} textAnchor="start">{simFormatNumber(lo, digits)}</text>
        <text x={W - m.right} y={H - 10} textAnchor="end">{simFormatNumber(hi, digits)} {unit}</text>
        <text x={(m.left + W - m.right) / 2} y={H - 10} textAnchor="middle">runs per bin</text>
      </svg>
    </div>
  );
};

const SimTornado = ({ items }) => {
  const shown = items.slice(0, 8);
  const [chartRef, W] = simUseWidth(420);
  const row = 26;
  const H = shown.length * row + 26;
  const left = Math.min(190, W * 0.42);
  const mid = left + (W - left - 40) / 2;
  const half = (W - left - 40) / 2;
  if (!shown.length) return <p className="sim-field__hint" ref={chartRef}>Vary at least one input to see its influence.</p>;
  return (
    <div className="sim-chart" ref={chartRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Rank correlations: ${shown.map(item => `${item.label} ${item.rho.toFixed(2)}`).join(', ')}`}>
        <line className="sim-chart__axis" x1={mid} x2={mid} y1={4} y2={H - 20} />
        {shown.map((item, i) => {
          const yy = 6 + i * row;
          const w = half * Math.abs(item.rho);
          return (
            <g key={item.key}>
              <text x={left - 8} y={yy + 14} textAnchor="end" style={{ fill: 'var(--sim-ink)' }}>{item.label}</text>
              <rect x={item.rho >= 0 ? mid : mid - w} y={yy + 3} width={Math.max(1, w)} height={row - 10} rx="3" fill={item.rho >= 0 ? 'var(--sim-c-structural)' : 'var(--sim-c-dissolved)'} />
              <text x={item.rho >= 0 ? mid + w + 4 : mid - w - 4} y={yy + 14} textAnchor={item.rho >= 0 ? 'start' : 'end'}>{item.rho.toFixed(2)}</text>
            </g>
          );
        })}
        <text x={mid - half} y={H - 4} textAnchor="start">−1 lowers it</text>
        <text x={mid + half} y={H - 4} textAnchor="end">raises it +1</text>
      </svg>
    </div>
  );
};

const simAxisNumber = value => simFormatNumber(value, Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 1 ? 2 : 3);

const SimScatter = ({ points, xLabel, yLabel, log, onSelect }) => {
  const [chartRef, W] = simUseWidth(760);
  const H = 280;
  const m = { left: 52, right: 14, top: 12, bottom: 40 };
  const [active, setActive] = useState(null);
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const tx = v => log ? Math.log10(v) : v;
  const xMin = Math.min(...xs.map(tx));
  const xMax = Math.max(...xs.map(tx));
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(...ys) || 1;
  const x = v => m.left + (W - m.left - m.right) * (tx(v) - xMin) / ((xMax - xMin) || 1);
  const y = v => H - m.bottom - (H - m.top - m.bottom) * (v - yMin) / ((yMax - yMin) || 1);
  return (
    <div className="sim-chart" ref={chartRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${yLabel} against ${xLabel} for each run`}>
        {simTicks(yMin, yMax, 4).map(t => <g key={t}><line className="sim-chart__grid" x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} /><text x={m.left - 6} y={y(t) + 4} textAnchor="end">{simFormatNumber(t, t < 10 ? 1 : 0)}</text></g>)}
        <line className="sim-chart__axis" x1={m.left} x2={W - m.right} y1={H - m.bottom} y2={H - m.bottom} />
        <text x={m.left} y={H - 20}>{simAxisNumber(log ? 10 ** xMin : xMin)}</text>
        <text x={W - m.right} y={H - 20} textAnchor="end">{simAxisNumber(log ? 10 ** xMax : xMax)}</text>
        <text x={(m.left + W - m.right) / 2} y={H - 6} textAnchor="middle">{xLabel}{log ? ' (log scale)' : ''}</text>
        {points.map((p, i) => (
          <circle key={i} cx={x(p.x)} cy={y(p.y)} r={active === i ? 7 : 5} fill="var(--sim-c-free)" stroke="var(--sim-surface)" strokeWidth="2"
            tabIndex={0} role="button" aria-label={`Open run ${i + 1}: ${xLabel} ${simFormatNumber(p.x, 2)}, ${yLabel} ${simFormatNumber(p.y, 2)}`}
            style={{ cursor: 'pointer', transition: 'r 120ms' }}
            onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
            onClick={() => onSelect(p)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(p); } }} />
        ))}
        {active !== null && (
          <text x={Math.min(W - 140, x(points[active].x) + 10)} y={Math.max(16, y(points[active].y) - 10)} style={{ fill: 'var(--sim-ink)' }}>
            {`${simFormatNumber(points[active].x, 2)} → ${simFormatNumber(points[active].y, 2)}`}
          </text>
        )}
      </svg>
    </div>
  );
};
