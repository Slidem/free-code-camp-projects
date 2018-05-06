// ############ PRIORITY QUEUE
{ const top = 0, parent = c => (c + 1 >>> 1) - 1, left = c => (c << 1) + 1, right = c => c + 1 << 1; class PriorityQueue { constructor(c = (d, e) => d > e) { this._heap = [], this._comparator = c } size() { return this._heap.length } isEmpty() { return 0 == this.size() } peek() { return this._heap[top] } push(...c) { return c.forEach(d => { this._heap.push(d), this._siftUp() }), this.size() } pop() { const c = this.peek(), d = this.size() - 1; return d > top && this._swap(top, d), this._heap.pop(), this._siftDown(), c } replace(c) { const d = this.peek(); return this._heap[top] = c, this._siftDown(), d } _greater(c, d) { return this._comparator(this._heap[c], this._heap[d]) } _swap(c, d) { [this._heap[c], this._heap[d]] = [this._heap[d], this._heap[c]] } _siftUp() { for (let c = this.size() - 1; c > top && this._greater(c, parent(c));)this._swap(c, parent(c)), c = parent(c) } _siftDown() { for (let d, c = top; left(c) < this.size() && this._greater(left(c), c) || right(c) < this.size() && this._greater(right(c), c);)d = right(c) < this.size() && this._greater(right(c), left(c)) ? right(c) : left(c), this._swap(c, d), c = d } } window.PriorityQueue = PriorityQueue }
// ############ 

class MoveObserver {

  constructor(notifyFunction) {
    this._notifyFunction = notifyFunction;
  }

  notify(board, row, coll, player) {
    this._notifyFunction(board, row, coll, player);
  }

}

class Player {

  constructor(sign, moveObservers) {
    this._sign = sign;
    this._moveObservers = moveObservers;
  }
  getSign() {
    return this._sign;
  }

  makeMove(board, row, coll) {
    if (this._moveObservers !== null) {
      this._moveObservers.forEach(o => o.notify(board, row, coll, this));
    }
  }

  getWinMessage() { }

  getWinColor() { }

  getTurnMessage() { }
}

class AiPlayer extends Player {
  getWinMessage() {
    return "You lost !";
  }

  getWinColor() {
    return "red";
  }

  getTurnMessage() {
    return "Your turn!";
  }
}

class HumanPlayer extends Player {
  getWinMessage() {
    return "You won !";
  }

  getWinColor() {
    return "green";
  }

  getTurnMessage() {
    return "Computer's turn ! Please wait...";
  }
}

class Cell {

  constructor(row, col) {
    this._row = row;
    this._col = col;
    this._player = null;
  }

  occupy(player) {
    this._player = player;
  }

  isOccupied() {
    return this._player !== null;
  }

  isOccupiedBy(player) {
    return this._player === player;
  }

  isOccupiedByOponent(player) {
    return this._player !== null && this._player !== player;
  }

  getRow() {
    return this._row;
  }

  getCol() {
    return this._col;
  }

  getPlayer() {
    return this._player;
  }

  equalsPosition(otherCell) {
    if (!otherCell) {
      return false;
    }
    return this._row == otherCell.getRow() && this._col == otherCell.getCol();
  }
}

class Board {
  constructor() {
    this._initCells();
    this._winnerInfo = null;
  }

  _initCells() {
    this._cells = [];
    for (let i = 0; i < 3; i++) {
      this._cells[i] = [];
      for (let j = 0; j < 3; j++) {
        this._cells[i][j] = new Cell(i, j);
      }
    }

  }

  getAvailableCells() {
    return this._getCells(function (cell) {
      return !cell.isOccupied();
    });
  }

  getPlayerCells(player) {
    return this._getCells(function (cell) {
      return cell.isOccupiedBy(player);
    });
  }

  getOtherPlayerCells(player) {
    return this._getCells(function (cell) {
      return !cell.isOccupiedBy(player) && cell.isOccupied();
    });
  }

  getOccupiedCells() {
    return this._getCells(function (cell) {
      return cell.isOccupied();
    });
  }

  getCellRow(cell) {
    let row = cell.getRow();
    let rowCells = [];
    for (let col = 0; col < 3; col++) {
      rowCells.push(this._cells[row][col]);
    }
    return rowCells;
  }

  getCellColumn(cell) {
    let col = cell.getCol();
    let colCells = [];
    for (let row = 0; row < 3; row++) {
      colCells.push(this._cells[row][col]);
    }
    return colCells;
  }

  getDiagonals(){
    return this.getCellDiagonal(this._cells[1][1]);
  }

  getCellDiagonal(cell) {
    if (!this._cellIsOnDiagonal(cell)) {
      return {
        "diagionals": 0,
        "diagonal": null
      };
    }

    if (cell.getRow() == 1 && cell.getCol() === 1) {
      return {
        "diagonals": 2,
        "diagonal": [[this._cells[0][0], this._cells[1][1], this._cells[2][2]], [this._cells[0][2], this._cells[1][1], this._cells[2][0]]],
      }
    }

    if (cell.getRow() === cell.getCol()) {
      return {
        "diagonals": 1,
        "diagonal": [this._cells[0][0], this._cells[1][1], this._cells[2][2]]
      }
    } else {
      return {
        "diagonals": 1,
        "diagonal": [this._cells[0][2], this._cells[1][1], this._cells[2][0]]
      }
    }
  }

  isDraw() {
    return this.getAvailableCells().length === 0;
  }

  getWinnerInfo() {
    return this._winnerInfo;
  }

  isOnWin() {
    return this._winnerInfo !== null;
  }

  _computeWinnerInfo() {
    let firstRow = this.getCellRow(this._cells[0][0]);
    let secondRow = this.getCellRow(this._cells[1][0]);
    let thirdRow = this.getCellRow(this._cells[2][0]);

    let firstCol = this.getCellColumn(this._cells[0][0]);
    let secondCol = this.getCellColumn(this._cells[0][1]);
    let thirdCol = this.getCellColumn(this._cells[0][2]);

    let diagonals = this.getCellDiagonal(this._cells[1][1]);

    return this._getWinnerLine([firstRow, secondRow, thirdRow, firstCol, secondCol, thirdCol, diagonals.diagonal[0], diagonals.diagonal[1]]);
  }

  _getWinnerLine(lines) {
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let player = line[0].getPlayer();
      let winningLine = true;
      for (let j = 0; j < 3; j++) {
        let cell = line[j];
        if (!cell.isOccupied()) {
          winningLine = false;
          break;
        }
        if (cell.getPlayer() !== player) {
          winningLine = false;
        }
      }
      if (winningLine) {
        return {
          "player": player,
          "line": line
        };
      }
    }
    return null;
  }

  lock() {
    this._locked = true;
  }

  unlock() {
    this._locked = false;
  }

  isLocked() {
    return this._locked;
  }

  reset() {
    this._initCells();
    $('.board-cell').html('');
    $('.board-cell').css('color', 'white');
    $('.game-status > h3').css('color', 'black');
    this._winnerInfo = null;
    this.unlock();
  }

  put(row, col, player) {
    if (this.isLocked()) {
      return;
    }
    let cell = $('.cell-' + row + '-' + col);
    let currentValue = cell.html();
    if (isEmpty(currentValue) && !this.isOnWin()) {
      $('.game-status > h3').html(player.getTurnMessage());
      cell.html(player.getSign());
      this._cells[row][col].occupy(player);
      this._winnerInfo = this._computeWinnerInfo();
      return true;
    } else {
      return false;
    }
  }

  // cellProcessor -> process the cells if the processor returns true.
  _getCells(cellProcessor, player) {
    let occupiedCells = [];
    for (let i = 0; i < this._cells.length; i++) {
      for (let j = 0; j < this._cells.length; j++) {
        let cell = this._cells[i][j];
        if (cellProcessor(cell)) {
          occupiedCells.push(cell);
        }
      }
    }
    return occupiedCells;
  }

  _cellIsOnDiagonal(cell) {
    return cell.getRow() === cell.getCol() || Math.abs(cell.getRow() - cell.getCol()) === 2;
  }
}

class AIMove {
  constructor(board, cell, player) {
    this._cell = cell;
    this._player = player;
    this._board = board;
    this.validateCell();
    this._priority = this._computePriority();
  }

  validateCell() {
    let occupiedCells = this._board.getOccupiedCells();
    for (let i = 0; i < occupiedCells.length; i++) {
      if (occupiedCells[i].equalsPosition(this._cell)) {
        throw "Invalid cell. Cannot make a move on a cell already occupied";
      }
    }
  }

  getCell() {
    return this._cell;
  }

  getPlayer() {
    return this._player;
  }


  getPriority() {
    return this._priority;
  }

  _computePriority() {
    let availableCells = this._board.getAvailableCells().length;
    if (availableCells === 9 && this._cellIsOnCorner(this._cell)) {
      return Priorities.FIRST_MOVE;
    } else if (availableCells === 8) {
      let oponentCells = this._board.getOtherPlayerCells(this._player);
      let oponentCell = oponentCells[0];
      if(this._cellIsOnMiddle(oponentCell) && this._cellIsOnCorner(this._cell)){
        return Priorities.SECOND_MOVE_OPONENT_MIDDLE;
      }
      if (this._cellIsOnCorner(oponentCell) && this._cellIsOnMiddle(this._cell)) {
        return Priorities.SECOND_MOVE_OPONENT_CORNER;
      } else if (!this._cellIsOnMiddle(oponentCell) && this._cellIsOnMiddle(this._cell)) {
        return Priorities.SECOND_MOVE_OPONENT_OTHER;
      }
    } else if (this._isIminentThreat() && !this._isWin()) {
      return Priorities.IMINENT_THREAT;
    } else if (this._isWin()) {
      return Priorities.WIN;
    } else if (this._twoPossibleLines()) {
      return Priorities.MAKE_TWO_POSSIBLE_LINES;
    } else if (this._opponentCorners()) {
      return Priorities.OPPONENT_CORNERS;
    } else if (this._possibleLine()) {
      return Priorities.OPOSITE_CORNER_WITH_POSSIBLE_LINE;
    }
    return Priorities.LOWEST;
  }

  _isIminentThreat() {
    return this._fullLines(line => this._cellsOccupiedByOpponent(line)) > 0;
  }

  _isWin() {
    return this._fullLines(line => this._cellsOccupiedByPlayer(line)) > 0;
  }

  _twoPossibleLines() {
    return this._fullLines(line => this._cellsOccupiedByPlayer(line)) == 2;
  }

  _opponentCorners(){
     let playerCells = this._board.getPlayerCells(this._player);
     let diagonals = this._board.getDiagonals().diagonal;
     let opponentHasCellsOnCorner = this._getLineCellsBasedOnCriteria(diagonals[0],  cell => cell.isOccupiedByOponent(this._player)) == 2 || this._getLineCellsBasedOnCriteria(diagonals[1],  cell => cell.isOccupiedByOponent(this._player)) == 2;
     if(playerCells.length === 1 && !this._cellIsOnCorner(this._cell) && !this._cellIsOnMiddle(this._cell) && opponentHasCellsOnCorner){
      return true;
     }
     return false;
  }

  _possibleLine() {
    if (this._cellIsOnCorner(this._cell)) {
      let cellRow = this._board.getCellRow(this._cell);
      let cellColumn = this._board.getCellColumn(this._cell);
      let cellDiagonal = this._board.getCellDiagonal(this._cell).diagonal;
      return !this._lineContainsOponentCell(cellRow) && this._lineContainsPlayerCell(cellRow) || 
             !this._lineContainsOponentCell(cellColumn) && this._lineContainsPlayerCell(cellColumn) ||
             !this._lineContainsOponentCell(cellDiagonal) && this._lineContainsPlayerCell(cellDiagonal) && (this._lineContainsOponentCell(cellRow) || this._lineContainsOponentCell(cellColumn));
    } 
    return false;
  }


  _fullLines(targetCellsProvider) {
    let lineCount = 0;
    let cellRow = this._board.getCellRow(this._cell);
    let cellColumn = this._board.getCellColumn(this._cell);
    let cellDiagonal = this._board.getCellDiagonal(this._cell);
    if (targetCellsProvider(cellRow) == 2) {
      lineCount++;
    }
    if (targetCellsProvider(cellColumn) == 2) {
      lineCount++;
    }
    if (cellDiagonal.diagonals === 1 && targetCellsProvider(cellDiagonal.diagonal) == 2) {
      lineCount++;
    }
    if (cellDiagonal.diagonals === 2) {
      if (targetCellsProvider(cellDiagonal.diagonal[0]) == 2) {
        lineCount++;
      }

      if (targetCellsProvider(cellDiagonal.diagonal[1]) == 2) {
        lineCount++;
      }
    }
    return lineCount;
  }

  _cellsOccupiedByOpponent(line) {
    return this._getLineCellsBasedOnCriteria(line, cell => cell.isOccupiedByOponent(this._player));
  }
  _cellsOccupiedByPlayer(line) {
    return this._getLineCellsBasedOnCriteria(line, cell => cell.isOccupiedBy(this._player));
  }

  _getLineCellsBasedOnCriteria(line, criteria) {
    let count = 0;
    for (let i = 0; i < line.length; i++) {
      if (criteria(line[i])) {
        count++;
      }
    }
    return count;
  }

  _lineContainsOponentCell(line) {
    return this._lineContainsCell(line, cell => cell.isOccupiedByOponent(this._player));
  }

  _lineContainsPlayerCell(line) {
    return this._lineContainsCell(line, cell => cell.isOccupiedBy(this._player));
  }

  _lineContainsCell(line, cellPredicate) {
    for (let i = 0; i < line.length; i++) {
      if (cellPredicate(line[i])) {
        return true;
      }
    }
    return false;
  }

  _cellIsOnCorner(cell) {
    let row = cell.getRow();
    let col = cell.getCol();

    return row === 0 && col === 0 ||
      row === 2 && col === 0 ||
      row === 0 && col === 2 ||
      row === 2 && col === 2;
  }

  _cellIsOnMiddle(cell) {
    return cell.getRow() === 1 && cell.getCol() === 1;
  }

}

const Priorities = {
  'FIRST_MOVE': 1,
  'SECOND_MOVE_OPONENT_MIDDLE': 2,
  'SECOND_MOVE_OPONENT_CORNER': 3,
  'SECOND_MOVE_OPONENT_OTHER': 4,
  'WIN': 5,
  'IMINENT_THREAT': 6,
  'MAKE_TWO_POSSIBLE_LINES': 7,
  'CORNER_WTIH_ONE_LINE_POSSIBLE': 8,
  'OPPONENT_CORNERS': 9,
  'OPOSITE_CORNER_WITH_POSSIBLE_LINE': 10,
  'LOWEST': 999
};

const SIGN_X = 'x';
const SIGN_O = 'o';
var AI;
var HUMAN;

const board = new Board();

$(document).ready(function () {

  $('.type-selection-div').on('click', function () {
    let selectedSign = $(this).html();

    HUMAN = new HumanPlayer(selectedSign, [getHumanObserver()]);
    AI = new AiPlayer(getOtherSign(selectedSign), [getAiObserver()]);

    if (AI.getSign() == SIGN_X) {
      $('.game-status > h3').html(HUMAN.getTurnMessage());
      computeAiMove(board, AI);
    } else {
      $('.game-status > h3').html(AI.getTurnMessage());
    }

    $('.board-cell').on('click', function () {
      let cellClass = getCellClass($(this));
      let added = HUMAN.makeMove(board, getRow(cellClass), getColl(cellClass));
    });

    startGame();
  });
});

function startGame() {
  displayBoard();
}

function displayBoard() {
  $('.board-container').removeClass('invisible');
  $('.game-selection-container').addClass('invisible');
  $('.choose-text-div').addClass('invisible');
  $('.game-status').removeClass('invisible');
}

function hideBoard() {
  $('.board-container').addClass('invisible');
  $('.game-status').addClass('invisible');
  $('.game-selection-container').removeClass('invisible');
  $('.choose-text-div').removeClass('invisible');
}

function getHumanObserver() {
  return new MoveObserver(function (board, row, col, player) {

    if (!board.isOnWin()) {
      let added = board.put(row, col, player);
      if (added) {
        if (board.isDraw()) {
          makeDraw();
          return;
        }
        computeAiMove(board, AI);
      } else if (board.isOnWin()) {
        //should never happen. Humans can never win against AI. Most likely they will draw :)
        showWin(baord, player);
      }
    }

  });
}

function getAiObserver() {
  return new MoveObserver(function (board, row, col, player) {

    if (!board.isOnWin()) {
      board.lock();
      setTimeout(function () {
        board.unlock();
        board.put(row, col, player);
        if (board.isDraw()) {
          makeDraw();
        } else if(board.isOnWin()){
          showWin(board, player);
        }
      }, 1000);
    }
  });
}


function showWin(board, player) {
  $('.game-status > h3').html(player.getWinMessage());
  $('.game-status > h3').css('color', player.getWinColor());
  let winningLine = board.getWinnerInfo().line;
  for (let i = 0; i < winningLine.length; i++) {
    let cell = winningLine[i];
    $('.cell-' + cell.getRow() + '-' + cell.getCol()).css('color', player.getWinColor());
  }

  setTimeout(function () {
    reset(board);
  }, 3000);
}

function makeDraw() {
  $('.game-status > h3').html('It`s a draw !');

  setTimeout(function () {
    reset(board);
  }, 3000);
}


function getOtherSign(sign) {
  return sign === SIGN_X ? SIGN_O : SIGN_X;
}

function getCellClass(cell) {
  return cell.attr('class').split(' ').filter(function (value) {
    return hasNumber(value);
  }).reduce(function (result, current) {
    return result + current;
  }, '');
}

function hasNumber(str) {
  return /\d/.test(str);
}

function getRow(cellClass) {
  return cellClass.split('-')[1];
}

function getColl(cellClass) {
  return cellClass.split('-')[2];
}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function shuffle(array) {
  let currentIndex = array.length, temp, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
}

function computeAiMove(board, aiPlayer) {
  let aiMove = computeMove(board, aiPlayer);
  if (!aiMove) {
    return;
  }
  aiPlayer.makeMove(board, aiMove.getCell().getRow(), aiMove.getCell().getCol());
}

//availableCells should come in random order each time.
function computeMove(board, player) {

  let availableCells = [];
  availableCells = availableCells.concat(board.getAvailableCells());

  if (!availableCells || availableCells.length === 0) {
    return null;
  }

  availableCells = shuffle(availableCells);

  let moves = new PriorityQueue((moveA, moveB) => moveA.getPriority() < moveB.getPriority());

  while (availableCells.length !== 0) {
    let c = availableCells.shift();
    moves.push(new AIMove(board, c, player));
  }

  return moves.peek();
}

function reset(board) {
  board.reset();
  hideBoard();
}



