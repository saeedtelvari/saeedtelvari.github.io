const https = require('https');
const fs = require('fs');
const vm = require('vm');

console.log('Fetching Babel compiler...');

https.get('https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const contextBabel = { window: {}, console: console, process: process };
    vm.createContext(contextBabel);
    vm.runInContext(data, contextBabel);
    const Babel = contextBabel.Babel || contextBabel.window.Babel;

    // Three bundles:
    //   bundle.js            The site. Every page loads it: primitives, content, header, footer, hero, descent, sections, CV, App.
    //   story-bundle.js      The story. Only ve-story.html loads it, before bundle.js.
    //   simulator-bundle.js  The simulator. Only simulator.html loads it, before bundle.js.
    const files = [
      'Primitives.jsx',
      'site-content.js',
      'Header.jsx',
      'Footer.jsx',
      'hero-geology.js',
      'SubsurfaceHero.jsx',
      'GeologicalDescent.jsx',
      'HomeSections.jsx',
      'CVPage.jsx',
      'App.jsx'
    ];
    const storyFiles = [
      'story-content.js',
      've2d-model.js',
      'story-geometry.js',
      'StoryStage.jsx',
      'StoryChapters.jsx',
      'StoryEarth.jsx',
      'StoryFields.jsx',
      'StoryRock.jsx',
      'StoryBlock.jsx',
      'StoryPage.jsx'
    ];
    const simulatorFiles = ['ve2d-model.js', 'sim-block3d.js', 'GuidePage.jsx', 'SimCharts.jsx', 'SimViews.jsx', 'SimReport.jsx', 'SimulatorPage.jsx'];

    // The site bundle and the story bundle drop the comments and the extra white space. The sources keep both.
    // A test that reads one of these bundles must not depend on spacing.
    // The simulator bundle keeps its output as it was.
    const compile = (sourceFiles, options = {}) => {
      let output = '"use strict";\n';
      output += '// Auto-generated bundle — Pre-compiled for instant execution\n';
      output += 'var { useState, useEffect, useMemo, useRef, useCallback } = React;\n\n';
      for (const file of sourceFiles) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/const\s*\{\s*[^}]+\s*\}\s*=\s*React\s*;?/g, '// [destructured React]');
        output += '// File: ' + file + '\n' + Babel.transform(code, { presets: ['react'], ...options }).code + '\n\n';
      }
      return output;
    };

    const compact = { comments: false, compact: true };
    const combined = compile(files, compact);
    const storyCombined = compile(storyFiles, compact);
    const simulatorCombined = compile(simulatorFiles);

    fs.writeFileSync('bundle.js', combined, 'utf8');
    fs.writeFileSync('story-bundle.js', storyCombined, 'utf8');
    fs.writeFileSync('simulator-bundle.js', simulatorCombined, 'utf8');
    console.log('✓ Successfully generated bundle.js (' + (combined.length / 1024).toFixed(1) + ' KB)');
    console.log('✓ Successfully generated story-bundle.js (' + (storyCombined.length / 1024).toFixed(1) + ' KB)');
    console.log('✓ Successfully generated simulator-bundle.js (' + (simulatorCombined.length / 1024).toFixed(1) + ' KB)');

    // Validate VM execution. Each page gets its own context and its own set of bundles, in the order of its script tags.
    const makeContext = (page) => {
      const mockElement = {
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {} },
        addEventListener: () => {},
        removeEventListener: () => {},
        getBoundingClientRect: () => ({ top: 0, left: 0, width: 1000, height: 500 }),
        getAttribute: () => page,
        style: {},
        offsetTop: 0
      };
      const mockDoc = {
        getElementById: (id) => mockElement,
        querySelector: () => mockElement,
        querySelectorAll: () => [],
        createElement: () => mockElement,
        addEventListener: () => {},
        removeEventListener: () => {},
        body: mockElement,
        documentElement: mockElement
      };
      const mockWindow = {
        addEventListener: () => {},
        removeEventListener: () => {},
        scrollTo: () => {},
        scrollX: 0,
        scrollY: 0,
        innerWidth: 1200,
        innerHeight: 800,
        document: mockDoc,
        requestAnimationFrame: (cb) => setTimeout(cb, 0),
        cancelAnimationFrame: () => {},
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
      };
      const testContext = {
        window: mockWindow,
        document: mockDoc,
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        Math: Math,
        JSON: JSON,
        Array: Array,
        Object: Object,
        parseFloat: parseFloat,
        parseInt: parseInt,
        React: {
          useState: (v) => [v, () => {}],
          useEffect: (fn) => {},
          useLayoutEffect: (fn) => {},
          useMemo: (fn) => fn(),
          useRef: (v) => ({ current: v }),
          useCallback: (fn) => fn,
          memo: (component) => component,
          createElement: () => ({}),
          Fragment: 'Fragment'
        },
        ReactDOM: {
          createRoot: () => ({ render: () => {} })
        }
      };
      vm.createContext(testContext);
      return testContext;
    };
    const pages = [
      ['home', null, [combined]],
      ['cv', 'cv', [combined]],
      ['story', 'story', [storyCombined, combined]],
      ['simulator', 'simulator', [simulatorCombined, combined]]
    ];
    try {
      for (const [name, page, bundles] of pages) {
        const context = makeContext(page);
        for (const bundle of bundles) vm.runInContext(bundle, context);
        console.log('✓ The ' + name + ' page bundles executed cleanly.');
      }
    } catch (err) {
      console.error('✗ Execution error:', err);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error('HTTP error:', e.message);
  process.exit(1);
});
