// Solves Sudoku.
// Try it: copy-paste everything below and run in Chrome DevTools Console.

(function() {

function assert(condition) {
  if (condition) return;
  console.assert.apply(console, arguments);
  debugger;
  throw new Error('Assertion failed');
}

class Set9 {
  constructor() {
    this.mask = Array(9).fill(0);
    this.size = 9;
  }

  mark(x) {
    assert(0 <= x && x < 9);
    if (this.mask[x] == 0) {
      this.mask[x] = 1;
      --this.size;
      return true;
    }
    return false;
  }

  isSet(x) {
    assert(0 <= x && x < 9);
    return this.mask[x] == 1;
  }
}

class Sudoku {
  constructor() {
    this.rowsMask = Array(9).fill(0).map(_ => new Set9());
    this.columnMask = Array(9).fill(0).map(_ => new Set9());
    this.squareMask = Array(9).fill(0).map(_ => new Set9());
    this.numbersMask = Array(9).fill(0).map(_ => Array(9).fill(0).map(_ => new Set9()));
    this.sudoku = Array(9).fill(0).map(_ => Array(9).fill(0));
    this.left = 81;
  }

  copyFrom(other) {
    this.rowsMask = other.rowsMask;
    this.columnMask = other.columnMask;
    this.squareMask = other.squareMask;
    this.numbersMask = other.numbersMask;
    this.sudoku = other.sudoku;
    this.left = other.left;
  }

  static buildFrom(rows) {
    let sudoku = new Sudoku();
    for (let row = 0; row < 9; ++row) {
      for (let column = 0; column < 9; ++column) {
        if (rows[row][column] != 0) {
          assert(sudoku.setSquare(row, column, rows[row][column]));
        }
      }
    }
    return sudoku;
  }

  clone() {
    return Sudoku.buildFrom(this.sudoku);
  }

  setSquare(row, column, number) {
    assert(1 <= number && number <= 9);
    if (this.sudoku[row][column] == number) return true;
    if (this.sudoku[row][column] != 0) return false;

    this.sudoku[row][column] = number;
    --this.left;
    --number;

    if (!this.rowsMask[row].mark(number)) return false;
    if (!this.columnMask[column].mark(number)) return false;
    const square = this.square_(row, column);
    if (!this.squareMask[square].mark(number)) return false;

    // Update whitelisted number positions within the square.
    const localIndex = this.localIndex_(row, column);
    for (let i = 0; i < 9; ++i) {
      const numberMask = this.numbersMask[square];
      numberMask[number].mark(i);
      if (numberMask[i].mark(localIndex)
          && numberMask[i].size == 0
          && !this.squareMask[square].isSet(i)) {
        return false;
      }
    }
    // Update along the row.
    for (let c = 0; c < 9; ++c) {
      const sq = this.square_(row, c);
      const index = this.localIndex_(row, c);
      const numberMask = this.numbersMask[sq];
      if (numberMask[number].mark(index)
          && numberMask[number].size == 0
          && !this.squareMask[sq].isSet(number)) {
        return false;
      }
    }
    // Update along the column.
    for (let r = 0; r < 9; ++r) {
      const sq = this.square_(r, column);
      const index = this.localIndex_(r, column);
      const numberMask = this.numbersMask[sq];
      if (numberMask[number].mark(index)
          && numberMask[number].size == 0
          && !this.squareMask[sq].isSet(number)) {
        return false;
      }
    }
    return true;
  }

  fastResolve_() {
    while (1) {
      let changed = false;
      for (let square = 0; square < 9; ++square) {
        const numberMask = this.numbersMask[square];
        for (let number = 0; number < 9; ++number) {
          if (numberMask[number].size != 1) continue;
          for (let index = 0; index < 9; ++index) {
            if (!numberMask[number].isSet(index)) {
              const row = ((index / 3) >> 0) + ((square / 3) >> 0) * 3;
              const column = (index % 3) + (square % 3) * 3;
//               console.log("Fast resolved: row %d, column %d => %d", row, column, number + 1);
              if (!this.setSquare(row, column, number + 1)) return false;
              changed = true;
              break;
            }
          }
        }
      }
      if (!changed) break;
    }
    return true;
  }

  resolveImpl_(index, solutions) {
    if (!this.fastResolve_()) return false;
    if (this.left == 0) {
      solutions.push(this.clone());
      return solutions.length == 2;
    }
    for (; index < 81; ++index) {
      const row = (index / 9) >> 0;
      const column = (index % 9);
      if (this.sudoku[row][column] != 0) continue;
      const square = this.square_(row, column);
      const localIndex = this.localIndex_(row, column);
      for (let number = 0; number < 9; ++number) {
        if (this.numbersMask[square][number].isSet(localIndex)) continue;
        let savedSudoku = this.clone();
//         console.log("Trying: row %d, column %d => %d", row, column, number + 1);
        if (this.setSquare(row, column, number + 1)
            && this.resolveImpl_(index + 1, solutions)) {
          return true;
        }
//         console.log("Restoring: row %d, column %d", row, column);
        this.copyFrom(savedSudoku);
      }
      break;
    }
    return false;
  }

  resolve() {
    let solutions = [];
    this.resolveImpl_(0, solutions);
    if (solutions.length == 0) return false;
    if (solutions.length > 1) {
      console.warn("Not unique solution!");
    }
    this.copyFrom(solutions[0]);
    return true;
  }

  square_(row, column) {
    return ((row / 3) >> 0) * 3 + ((column / 3) >> 0);
  }

  localIndex_(row, column) {
    return (row % 3) * 3 + (column % 3);
  }
}

function parseInput(input) {
  let rows = input.trim().split("\n").map(row => row.split("").map(x => +x));
  assert(rows.length == 9);
  return rows;
}

function solve(rows) {
  console.time("Runtime");
  let sudoku = Sudoku.buildFrom(rows);
  assert(sudoku.resolve(), "Unknown squares: " + sudoku.left);
//   console.log(sudoku);
  console.log(sudoku.sudoku.map(row => row.join(" ")).join("\n"));
  console.timeEnd("Runtime");
}

console.clear();
console.time("Total runtime");

solve(parseInput(`
000809000
008617400
069000720
740000065
020000090
890000072
087000910
005786200
000401000
`));

solve(parseInput(`
000300000
005009340
090050870
400010090
008905100
020080004
012090080
074500900
000006000
`));

solve(parseInput(`
042500000
800070950
500010600
600000100
089000000
000000047
038700000
050009001
000004060
`));

solve(parseInput(`
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
`));

solve(parseInput(`
100074300
090820000
000009001
050000803
930000016
407000090
500900000
000015060
004760002
`));

solve(parseInput(`
000060000
030000060
700001002
000009040
000700000
901008075
020000080
080020001
005400030
`));

// A Sudoku designed to work against the brute force algorithm.
// https://en.wikipedia.org/wiki/Sudoku_solving_algorithms
solve(parseInput(`
000000000
000003085
001020000
000507000
004000100
090000000
500000073
002010000
000040009
`));

// A Sudoku with 17 clues and diagonal symmetry.
solve(parseInput(`
000000001
000000023
004005000
000100000
000030600
007000580
000067000
010004000
520000000
`));

console.timeEnd("Total runtime");
})();
