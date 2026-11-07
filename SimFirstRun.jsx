// First-run guide for the simulator. It has three short cards.
// The panel is not modal. The visitor can still use the map while it is open.

const SIM_GUIDE_KEY = 've-simulator-guide-seen';

// The goal comes from a run of the default scenario.
// The default well leaks about 5 % of the CO₂ in 1,000 years.
const SIM_GUIDE_GOAL = 'Move the well so that nothing leaks in 1,000 years.';

// Read the storage flag. Blocked storage must not stop the page.
const simGuideShouldOpen = () => {
  try {
    return window.localStorage.getItem(SIM_GUIDE_KEY) !== '1';
  } catch (error) {
    return true;
  }
};

const simGuideMarkSeen = () => {
  try {
    window.localStorage.setItem(SIM_GUIDE_KEY, '1');
  } catch (error) {
    // Storage is blocked. The guide will show once for each page load.
  }
};

const SimGuideDot = ({ colour }) => (
  <span className="sim-guide__dot" style={{ '--dot': colour }} aria-hidden="true" />
);

const SIM_GUIDE_CARDS = [
  {
    title: 'Read the map',
    body: (
      <>
        <p>This map shows CO₂ seen from above, in a saline aquifer.</p>
        <p>
          <SimGuideDot colour="var(--sim-glow-free)" />Teal is CO₂ that can move (free plume).{' '}
          <SimGuideDot colour="var(--sim-glow-structural)" />Blue and <SimGuideDot colour="var(--sim-c-residual)" />pink are trapped CO₂.
        </p>
      </>
    )
  },
  {
    title: 'Change the scenario',
    body: <p>Drag the well (INJ-1) on the map, or change an input. The model runs again in your browser.</p>
  },
  {
    title: 'Watch the fault',
    body: (
      <>
        <p>Watch the fault (F1). CO₂ leaks when the column under the fault passes the fault’s seal capacity.</p>
        <p className="sim-guide__goal"><strong>Try this:</strong> {SIM_GUIDE_GOAL}</p>
      </>
    )
  }
];

const SimFirstRun = ({ open, onClose }) => {
  const [index, setIndex] = useState(0);
  const nextRef = useRef(null);
  const last = index === SIM_GUIDE_CARDS.length - 1;
  const card = SIM_GUIDE_CARDS[index];

  const close = useCallback(() => {
    simGuideMarkSeen();
    onClose();
    // Return focus to the Guide button.
    const button = document.getElementById('sim-guide-button');
    if (button) button.focus();
  }, [onClose]);

  // Start at card 1 and move focus into the panel each time it opens.
  useEffect(() => {
    if (!open) return;
    setIndex(0);
    if (nextRef.current) nextRef.current.focus({ preventScroll: true });
  }, [open]);

  // Escape closes the guide.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = event => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;
  return (
    <div className="sim-guide" role="dialog" aria-modal="false" aria-labelledby="sim-guide-title">
      <p className="sim-guide__count">{index + 1} of {SIM_GUIDE_CARDS.length}</p>
      <h2 className="sim-guide__title" id="sim-guide-title">{card.title}</h2>
      <div className="sim-guide__body" aria-live="polite">{card.body}</div>
      <div className="sim-guide__actions">
        <button type="button" className="sim-button sim-button--quiet" onClick={close}>Skip</button>
        <span className="sim-guide__spacer" />
        <button type="button" className="sim-button" disabled={index === 0} onClick={() => setIndex(index - 1)}>Back</button>
        <button type="button" className="sim-button sim-button--primary" ref={nextRef} onClick={() => (last ? close() : setIndex(index + 1))}>{last ? 'Done' : 'Next'}</button>
      </div>
    </div>
  );
};

Object.assign(window, { SimFirstRun, simGuideShouldOpen, SIM_GUIDE_KEY });
