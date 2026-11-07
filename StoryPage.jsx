// StoryPage.jsx — the page ve-story.html, "How VE models work".
// The 7-stage story is first. One short end panel follows it. The panel has three links and no other copy.
// App.jsx renders StoryPage when data-page is "story". This file is in story-bundle.js.
// SkipLink, Header, Footer, siteNavigate and dismissLoader come from bundle.js. It loads after this file,
// and the page uses them at render time only.

const STORY_END_ID = 'story-end';

const StoryEnd = () => (
  <section id={STORY_END_ID} className="story-end" aria-labelledby="story-end-title">
    <div className="story-end__inner">
      <h2 id="story-end-title" className="story-end__title">Where to go next</h2>
      <p className="story-end__text">The live stage uses the same VE code as the simulator. In the simulator you can change the inputs.</p>
      <div className="story-end__links">
        <a className="btn btn--quiet" href="./index.html">Back to the homepage</a>
        <a className="btn btn--primary" href="./simulator.html">Open the VE simulator</a>
        <a className="btn btn--quiet" href="./index.html#publications">Read the publications</a>
      </div>
    </div>
  </section>
);

const StoryPage = () => {
  const navigate = (id, event) => siteNavigate('story', id, event);

  // A layout effect hides the loader before the first paint of the story.
  React.useLayoutEffect(() => dismissLoader(), []);

  // A link to ve-story.html#story-end lands on the end panel.
  useEffect(() => {
    const apply = () => {
      if (window.location.hash === `#${STORY_END_ID}`) requestAnimationFrame(() => siteScrollTo(STORY_END_ID));
    };
    apply();
    window.addEventListener('hashchange', apply);
    window.addEventListener('popstate', apply);
    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('popstate', apply);
    };
  }, []);

  return (
    <React.Fragment>
      <SkipLink />
      <Header active="story" story onNavigate={navigate} />
      <main id="main-content" tabIndex={-1}>
        <StoryStage onNavigate={navigate} />
        <StoryEnd />
      </main>
      <Footer onNavigate={navigate} />
    </React.Fragment>
  );
};

Object.assign(window, { StoryPage, StoryEnd });
