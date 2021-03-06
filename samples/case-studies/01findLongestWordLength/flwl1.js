/**
 * @see https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/basic-algorithm-scripting/find-the-longest-word-in-a-string
 */
function flwl(str) {
  const words = str.split(' ');
  let longest = 0;
  for (const word of words) {
    if (word.length > longest.length) {
      longest = word;
    }
  }
  return longest.length;
}


console.assert(
  flwl(
    "fox f2"
  ) === 3
  // findLongestWordLength(
  //   "The quick brown fox jumped over the lazy dog"
  // ) === 6
);