/**
  A narcissistic number is a positive whole number such that if its digits
  are read aloud in pairs from left to right, then the resulting statements
  would accurately and completely describe the quantities of all digits
  within the number.
*/
(function() {

function isNarcissistic(num) {
  let str = String(num);
  if (str.length & 1) return false;
  console.assert(/^[0-9]+$/.test(str));
  let nums = str.split('').map(x => +x);
  let freq = Array(10).fill(0);
  let represented = Array(10).fill(false);
  nums.forEach(x => ++freq[x]);
  for (let i = 0; i < nums.length; i += 2) {
    let count = nums[i];
    let digit = nums[i + 1];
    if (freq[digit] != count) return false;
    represented[digit] = true;
  }
  for (let i = 0; i < 10; ++i) {
    if (freq[i] > 0 && !represented[i]) return false;
  }
  return true;
}
// Quick tests.
[22, 4444, 23322110, 10212332, 666666, 88888888, 23322110,
 "303030414141415252525252636363747474757586868686868787879899999999",
 "414141416262626262627373737373737354858585858585859696969797989899",
 "20205151515151828282828282636363636363747474747474746586879899999999",
 "4040404051515151516262626262627373737373737364648585859687888899999999",
 "404040405151515151626262626262737373737373738484848485858576979898999999",
 "40404040515151515162626262626273737373737373848484848585859696969797989899"]
  .forEach(x => console.assert(isNarcissistic(x), x));
[23, 123, 44, 5151515151, 1413121110, 10212333, 888888]
  .forEach(x => console.assert(!isNarcissistic(x), x));

function* narcissisticsGenerator(L) {
  console.assert(L % 2 == 0);
  if (L % 2 != 0) return;

  let freq = Array(10).fill(0);
  let repeated = Array(10).fill(0);
  let usedFreq = Array(10).fill(0);

  function* bruteForce(digit, len) {
    if (len == 0) {
      if (freq.some((f, digit) => f != usedFreq[digit])) return;
      let result =
        freq.map((f, digit) => (f + "" + digit).repeat(repeated[digit])).join('');
      yield result;
      return;
    }
    if (digit < 0) return;

    let minLen = 0;
    let maxLen = 16 * (digit + 1);
    let minDigits = 0;
    for (let d = 9; d > digit; --d) {
      let diff = freq[d] - usedFreq[d];
      minLen += diff * 2;
      if (diff > 0) ++minDigits;
    }
    if (len < minLen || len > maxLen) return;
    if (digit + 1 < minDigits) return;

    for (let f = 9; f > usedFreq[digit]; --f) {
      let maxR = Math.min(f, len / 2);
      if (f > digit) {
        maxR = Math.min(maxR, freq[f] - usedFreq[f]);
      } else if (f == digit) {
        maxR = Math.min(maxR, 4);
      }
      for (let r = maxR; r > 0; --r) {
        freq[digit] = f;
        repeated[digit] = r;
        usedFreq[digit] += r;
        usedFreq[f] += r;
        len -= r * 2;

        if (len >= 0 &&
            usedFreq[f] <= 9 &&
            usedFreq[digit] <= freq[digit] &&
            (f <= digit || usedFreq[f] <= freq[f])) {
          yield* bruteForce(digit - 1, len);
        }

        len += r * 2;
        usedFreq[f] -= r;
        usedFreq[digit] -= r;
        repeated[digit] = 0;
        freq[digit] = 0;
      }
    }
    // Do not use the `digit` in the solution.
    if (digit > 0 && usedFreq[digit] == 0) {
      yield* bruteForce(digit - 1, len);
    }
  }
  yield* bruteForce(9, L);
}

// Find all solutions.
// Runtimes:
// L=22: 519.945068359375 ms
// L=24: 927.94189453125 ms
// L=26: 2065.110107421875 ms
// L=28: 3327.35302734375 ms
// L=30: 6114.695068359375 ms
// L=40: 59505.926025390625 ms
// L=70: 283109.2099609375 ms
// L=72: 267977.72705078125 ms
// L=74: 246110.68310546875 ms
// L=76: 220400.52001953125 mst
// L=78: 217677.86108398438 ms
// L=80: 190747.22192382812 ms
// L=90: 58057.10400390625 ms
// L=100: 8044.643798828125 ms
(function() {
  let inputs = [
    [2, 1],
    [4, 1],
    [6, 2],
    [8, 53],
    [10, 59],
    [12, 299],
    [14, 425],
    [16, 1287],
    [18, 2854],
    [20, 4981],
    [22, 8316],
    // [24, 18657],
    // [26, 24807],
    // [28, 46499],
    // [30, 67564],
    // [40, 313623],
    // [70, 1884],
    // [72, 552],
    // [74, 84],
    // [76, 0],
    // [78, 0],
    // [80, 0],
    // [90, 0],
    // [100, 0],
    // [102, 0],
    // [104, 0],
  ];
  for (let [len, expectedSolutions] of inputs) {
    console.log("Solving for length: %s", len);
    console.time("Runtime");
    let gen = narcissisticsGenerator(len);
    let solutions = 0;
    let toPrint = 100;
    for (let result of gen) {
      ++solutions;
      console.assert(isNarcissistic(result), result);
      if (toPrint-- > 0) console.log("Narcissistic(%s):", len, result);
    }
    console.log("Solutions(%s):", len, solutions);
    console.timeEnd("Runtime");
    console.assert(solutions == expectedSolutions);
  }
})();

// Find a first solution for larger lengths.
// Runtimes:
// L=70: 2275.573974609375 ms
// L=72: 9437.425048828125 ms
// L=74: 41177.195068359375 ms
// L=76: 230383.998046875 ms
// L=78: 206876.92407226562 ms
// L=80: 176235.25512695312 ms
(function() {
  let inputs = [
    70,
    // 72,
    // 74,
    // 76,
    // 78,
    // 80,
  ];
  for (let len of inputs) {
    console.log("Finding first for length: %s", len);
    console.time("Runtime");
    let gen = narcissisticsGenerator(len);
    let solutions = 0;
    for (let result of gen) {
      ++solutions;
      console.assert(isNarcissistic(result), result);
      console.log("Narcissistic(%s):", len, result);
      break;
    }
    if (solutions == 0) console.log("No solutions for length %s", len);
    console.timeEnd("Runtime");
  }
})();

})()

