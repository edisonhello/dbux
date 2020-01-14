const path = require('path');

const dbuxRoot = path.resolve(__dirname + '/../..');
const folders = ['dbux-common', 'dbux-babel-plugin'];

let babelrcRoots = folders.map(f => path.join(dbuxRoot, f));

// fix: backslashes on windows
babelrcRoots = babelrcRoots.map(root => root.replace(/\\/g, '\\\\'));

let folderPrefix = path.join(dbuxRoot, `(${folders.map(f => `(${f})`).join('|')})`);
folderPrefix = folderPrefix.replace(/\\/g, '\\\\');
// console.warn('babelrcRoots', babelrcRoots);

// fix: sometimes drive letters on windows are capitalized, sometimes not
folderPrefix = folderPrefix.toLowerCase();

const babelRegisterOptions = {
  ignore: [
    // '**/node_modules/**',
    function (fpath) {
      // no node_modules
      if (fpath.match('node_modules')) {
        return true;
      }

      fpath = fpath.toLowerCase();

      const shouldIgnore = !fpath.match(folderPrefix);
      // console.warn(fpath, !shouldIgnore, folderPrefix);
      return shouldIgnore;
    }
  ],
  babelrc: true,
  sourceMaps: "both",
  retainLines: true,
  // plugins: [
  //   '@babel/plugin-transform-runtime'
  // ],
  presets: [
    "@babel/preset-env"
  ],
  // presets: [[
  //   "@babel/preset-env",
  //   {
  //     "loose": true,
  //     "useBuiltIns": "usage",
  //     "corejs": 3
  //   }
  // ]],
  babelrcRoots
};
const babelRegister = require('@babel/register');
babelRegister(babelRegisterOptions);

module.exports = require('./index');