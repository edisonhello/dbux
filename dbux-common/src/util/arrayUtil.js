import countBy from 'lodash/countBy';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';
import xor from 'lodash/xor';
import mergeWith from 'lodash/mergeWith';

/**
 * @see https://stackoverflow.com/questions/29951293/using-lodash-to-compare-arrays-items-existence-without-order
 */
export function areArraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  return xor(a, b).length === 0;
}


/**
 * Get counts of array of numbers, then sort it.
 * @returns {{ type, count }[]}
 */
export function countAndSort(a) {
  const counts = map(
    countBy(a),
    (count, type) => ({ type, count }) // map single object to array of small objects
  );

  return sortBy(counts, o => -o.count);
}

export function getOrCreateArrayOfArray(arr, index) {
  return arr[index] = (arr[index] || []);
}

export function pushArrayOfArray(arr, index, ...items) {
  const nestedArr = getOrCreateArrayOfArray(arr, index);
  nestedArr.push(...items);
}

export function mergeConcatArray(...inputs) {
  return mergeWith(...inputs,
    function customizer(dst, src) {
      if (Array.isArray(dst)) {
        return dst.concat(src);
      }
      return undefined;
    }
  );
}

// ###########################################################################
// binary search
// ###########################################################################

// use binary search to find arr.indexOf(x), arr must be sorted
export function binarySearchByKey(arr, x, makeKey) {
  if (makeKey) {
    arr = arr.map(makeKey);
    x = makeKey(x);
  }
  let start = 0;
  let end = arr.length - 1;
  let mid;

  while (start <= end) {
    mid = Math.floor((start + end) / 2);
    if (arr[mid] === x) return mid;
    else if (arr[mid] < x) start = mid + 1;
    else end = mid - 1;
  }

  // x not in arr
  return null;
}