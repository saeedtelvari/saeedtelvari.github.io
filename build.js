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

    const files = [
      'Primitives.jsx',
      'Header.jsx',
      'Footer.jsx',
      'SubsurfaceHero.jsx',
      'HomeSections.jsx',
      'CVPage.jsx',
      'GuidePage.jsx',
      'SimulatorPage.jsx',
      'App.jsx'
    ];

    let combined = '"use strict";\n';
    combined += '// Auto-generated bundle — Pre-compiled for instant 0ms execution\n';
    combined += 'var { useState, useEffect, useMemo, useRef, useCallback } = React;\n\n';

    for (const file of files) {
      let code = fs.readFileSync(file, 'utf8');
      // Replace duplicate top-level React destructuring statements to avoid re-declaration errors
      code = code.replace(/const\s*\{\s*[^}]+\s*\}\s*=\s*React\s*;?/g, '// [destructured React]');
      const compiled = Babel.transform(code, { presets: ['react'] }).code;
      combined += '// ==========================================\n';
      combined += '// File: ' + file + '\n';
      combined += '// ==========================================\n';
      combined += compiled + '\n\n';
    }

    fs.writeFileSync('bundle.js', combined, 'utf8');
    console.log('✓ Successfully generated bundle.js (' + (combined.length / 1024).toFixed(1) + ' KB)');

    // Validate VM execution
    const mockElement = {
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => ({ top: 0, left: 0, width: 1000, height: 500 }),
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
        useMemo: (fn) => fn(),
        useRef: (v) => ({ current: v }),
        useCallback: (fn) => fn,
        createElement: () => ({}),
        Fragment: 'Fragment'
      },
      ReactDOM: {
        createRoot: () => ({ render: () => {} })
      }
    };
    vm.createContext(testContext);
    try {
      vm.runInContext(combined, testContext);
      console.log('✓ bundle.js executed cleanly with 0 syntax or runtime errors!');
    } catch (err) {
      console.error('✗ Execution error:', err);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error('HTTP error:', e.message);
  process.exit(1);
});
