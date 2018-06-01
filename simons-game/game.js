const MOVE_RED = 'RED';
const MOVE_YELLOW = 'YELLOW';
const MOVE_GREEN = 'GREEN';
const MOVE_BLUE = 'BLUE';

class Game {

  constructor() {
    this._strictMode = false;
    this._on = false;
    this._isLocked = true;
    this._display = new Display('display');
    this._moveTracker = new MoveTracker(this);
    this._errorSound = new SoundPlayer(100);
    this._winSound = new SoundPlayer(550);
    this._initMoves();
  }

  toggleStrictMode() {
    let sm = this._strictMode ? false : true;
    if (!this._on) {
      sm = false;
    }
    this._strictMode = sm;
  }

  strictModeEnabled() {
    return this._strictMode;
  }

  turnOn() {
    this._moveTracker.reset();
    this._moveTracker.resetCounter();
    this._on = true;
    this._display.display('--');
  }

  turnOff() {
    this._on = false;
    this._strictMode = false;
    this._display.clearDisplay();
  }

  isOn() {
    return this._on;
  }

  isLocked() {
    return this._isLocked;
  }

  lock() {
    this._isLocked = true;
  }

  unlock() {
    this._isLocked = false;
  }

  start() {

    let game = this;
    game.turnOff();

    this.lock();
    let turnOffFor = 1000;
    let startTime = new Date().getTime();
    let currentTime = () => new Date().getTime();
    let elapsedTime = () => currentTime() - startTime;

    let nextMoves = this._moveTracker.getNextMoves();
    let displayMovesFunction = this._displayStart;

    let stopId = setInterval(function () {
      if (elapsedTime() > turnOffFor) {
        clearInterval(stopId);
        game.turnOn();
        displayMovesFunction.call(game);
      }
    }, 10);
  }

  playMoves() {
    this.lock();
    if (!this.isOn()) {
      return;
    }
    this._display.display(this._moveTracker.getNbOfNextMoves());
    let game = this;
    let moves = this._moveTracker.getNextMoves().slice();
    let waitTime = 5000;

    let movesMadeSupplier = () => game._moveTracker.getExecutedMoves();
    let currentMovesMade = movesMadeSupplier();

    let playMovesFunction = (moves) => {
      if (!game.isOn()) {
        return;
      }
      let movesMade = () => currentMovesMade != movesMadeSupplier();
      if (moves.length == 0) {
        game.unlock();
        let currentTime = new Date().getTime();
        let elapsedTime = () => new Date().getTime() - currentTime;
        let waitId = setInterval(function () {
          if (!game.isOn()) {
            clearInterval(waitId);
          }
          if (movesMade()) {
            clearInterval(waitId);
          }
          if (elapsedTime() > 5000 && game.isOn() && !movesMade()) {
            game.wrongMoveMade();
            clearInterval(waitId);
          }
        }, 10);
        return;
      }
      let move = moves.shift();
      let playF = () => move.playWithDurationAndCallBack(700, () => playMovesFunction(moves));
      setTimeout(function () {
        playF();
      }, 1000);
    }
    playMovesFunction(moves);
  }

  _displayStart() {
    let startTime = new Date().getTime();
    let displayDuration = 3000;
    let actualGame = this;
    let gameIsStoped = () => !actualGame.isOn();
    let stopDisplaySupplier = () => ((new Date().getTime() - startTime) > displayDuration) || gameIsStoped();
    let finishedObserver = () => actualGame.playMoves();

    let displayOptions = new DisplayOptionsBuilder()
      .withText('--')
      .withBlinkFrequencyInMillis(500)
      .withDisplayFinishedObserver(() => actualGame.playMoves.call(actualGame))
      .withStopFlagSupplier(stopDisplaySupplier)
      .build();

    this._display.displayAndBlink(displayOptions);
  }

  playMove(move) {
    this._moveTracker.addPlayerMove(move);
  }

  getMove(code) {
    switch (code) {
      case 1: return this._redMove;
      case 2: return this._blueMove;
      case 3: return this._greenMove;
      case 4: return this._yellowMove;
    }
  }

  wrongMoveMade() {

    let actualGame = this;

    if (this._strictMode) {
      this._moveTracker.resetCounter();
    }

    this._display.clearDisplay();

    let getTime = () => new Date().getTime();
    let startTime = getTime();
    let displayDuration = 2000;
    let elapsedTime = () => getTime() - startTime;
    let stopCondition = () => !actualGame.isOn() || elapsedTime() > displayDuration;

    let displayOptions = new DisplayOptionsBuilder()
      .withText('!!')
      .withBlinkFrequencyInMillis(300)
      .withDisplayFinishedObserver(() => actualGame.playMoves.call(actualGame))
      .withStopFlagSupplier(stopCondition)
      .build();

    this._display.displayAndBlink(displayOptions);
    this._errorSound.playWithCallBack(stopCondition, () => { });
  }

  validMoveMade() {
    let actualGame = this;

    if (actualGame._moveTracker.getMovesMade() == 21) {
      let getTime = () => new Date().getTime();
      let startTime = getTime();
      let displayDuration = 3000;
      let elapsedTime = () => getTime() - startTime;
      let stopCondition = () => !actualGame.isOn() || elapsedTime() > displayDuration;

      let displayOptions = new DisplayOptionsBuilder()
        .withText('**')
        .withBlinkFrequencyInMillis(100)
        .withDisplayFinishedObserver(function() {
          actualGame._moveTracker.reset();
          actualGame._moveTracker.resetCounter();
          actualGame.playMoves.call(actualGame);
        })
        .withStopFlagSupplier(stopCondition)
        .withBlinkSound(actualGame._winSound)
        .build();

      this._display.displayAndBlink(displayOptions);

      return;
    }

    setTimeout(function () {
      actualGame.playMoves();
    }, 500);
  }

  _initMoves() {
    this._initBlueMove();
    this._initRedMove();
    this._initYellowMove();
    this._initGreenMove();
  }

  _initBlueMove() {
    this._blueMove = this._createMove('blue', 'blue-light', 150);
  }

  _initRedMove() {
    this._redMove = this._createMove('red', 'red-light', 200);
  }

  _initYellowMove() {
    this._yellowMove = this._createMove('yellow', 'yellow-light', 250);
  }

  _initGreenMove() {
    this._greenMove = this._createMove('green', 'green-light', 300);
  }

  _createMove(id, lightClass, soundFrequency) {

    let soundPlayer = new SoundPlayer(soundFrequency);

    return new MoveBuilder()
      .withSoundPlayer(soundPlayer)
      .withGame(this)
      .withLightUpClass(lightClass)
      .withButtonId(id)
      .build();
  }
}

class MoveTracker {


  constructor(game) {
    this._counter = 1;
    this._executedMoves = 0;
    this._game = game;
    this._computerSeries = MoveSeries.randomMoveSeries(game, 20);
    this._playerSeries = new MoveSeries(game);
  }

  addPlayerMove(move) {
    this._executedMoves += 1;
    this._playerSeries.addMove(move);
    if (!this._computerSeries.isInOrder(this._playerSeries)) {
      this._playerSeries.removeLast();
      this._game.wrongMoveMade();
    } else {
      if (this._playerSeries.getMoves().length == this._counter) {
        this._counter += 1;
        this._playerSeries = new MoveSeries(this._game);
        this._game.validMoveMade();
      }
    }
  }

  getExecutedMoves() {
    return this._executedMoves;
  }

  getNextMoves() {
    let nextMoves = [];
    for (let i = 0; i < this._counter; i++) {
      nextMoves.push(this._computerSeries.getMoves()[i]);
    }
    return nextMoves;
  }

  getMovesMade() {
    return this._counter;
  }

  getNbOfNextMoves() {
    return this._counter;
  }

  resetCounter() {
    this._counter = 1;
  }

  reset() {
    this._computerSeries = MoveSeries.randomMoveSeries(this._game, 20);
  }

}

class MoveSeries {

  constructor(game) {
    this._moves = [];
    this._game = game;
  }

  addMove(move) {
    this._moves.push(move);
  }

  removeLast() {
    this._moves.pop();
  }

  getMoves() {
    return this._moves;
  }

  static randomMoveSeries(game, nbOfMoves) {
    let series = new MoveSeries(game);
    for (let i = 0; i < nbOfMoves; i++) {
      let code = Math.floor((Math.random() * 4) + 1);
      let move = game.getMove(code);
      series.addMove(move);
    }
    return series;
  }

  isInOrder(otherMoveSeries) {
    let length = Math.min(this._moves.length, otherMoveSeries._moves.length);
    for (let i = 0; i < length; i++) {
      let move = this._moves[i];
      let otherMove = otherMoveSeries._moves[i];
      if (move !== otherMove) {
        return false;
      }
    }
    return true;
  }
}
