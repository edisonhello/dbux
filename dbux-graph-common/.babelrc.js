const path = require('path');
const thisRoot = path.resolve(__dirname);

module.exports = {
  ignore: [path.join(thisRoot, 'node_modules')],
  "sourceMaps": "both",
  "retainLines": true,
  "presets": [
    "@babel/preset-env",
    "@babel/preset-flow"
  ],
  "plugins": [
    [
      "@babel/plugin-proposal-class-properties",
      {
        "loose": true
      }
    ],
    "@babel/plugin-proposal-optional-chaining",
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ],
    "@babel/plugin-proposal-function-bind",
    "@babel/plugin-syntax-export-default-from",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-flow",
    "@babel/plugin-transform-runtime"
  ]
};

// console.warn('[dbux-graph-common]', '.babelrc.js loaded');