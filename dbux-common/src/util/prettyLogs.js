import colors from 'colors/safe';
import { inspect } from 'util';

function doInspect(arg) {
  return inspect(arg, { depth: 1, colors: true });
}


/**
 * @see https://gist.github.com/RReverser/0a7caa89b465d1ed0c96
 */
function overrideLog(origLog, customColor) {
  const colorize = colors[customColor];
  return function customLogger(...args) {
    return origLog(...args.map(arg => (arg && arg.constructor === String) ? 
        colorize(arg) : 
        doInspect(arg)
      )
    );
  };  
}

console.log = overrideLog(console.error, 'gray');
console.error = overrideLog(console.error, 'red');
console.warn = overrideLog(console.warn, 'yellow');
console.debug = overrideLog(console.debug, 'gray');