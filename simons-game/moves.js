class Move {

  constructor(moveBuilder) {
    this._soundPlayer = moveBuilder._soundPlayer;
    this._game = moveBuilder._game;
    this._lightUpClass = moveBuilder._lightUpClass;
    this._buttonId = '#' + moveBuilder._buttonId;
    this._stop = true;
    this._initButtonBehaviour();

  }

  playNoDuration() {
    this._turnLightOn();
    this._stop = false;

    let move = this;

    this._soundPlayer.playWithCallBack(() => move._stop, () => move._game.playMove(move));
  }

  playWithDurationAndCallBack(durationInMilliseconds, callBackFunction) {
    if(!this._game.isOn()){
      return;
    }
    this._turnLightOn();
    let startTime = new Date().getTime();
    let currentTime = () => new Date().getTime();
    let elapsedTime = () => currentTime() - startTime;

    let move = this;

    let stopCondition = () => !move._game.isOn() || (elapsedTime() > durationInMilliseconds);
    let btnObj = $(this._buttonId);
    let lightClass = this._lightUpClass;
    let turnOffFunction = () => btnObj.removeClass(lightClass);
    let callBackAndTurnOff = () => {
      turnOffFunction();
      callBackFunction();
    };

    this._soundPlayer.playWithCallBack(stopCondition, callBackAndTurnOff);
  }

  stopPlay() {
    this._turnLightOff();
    this._stop = true;
  }

  _initButtonBehaviour() {
    let move = this;
    let playId = null;

    $(this._buttonId).on('mousedown', function () {
      if (move._game.isOn() && !move._game.isLocked()) {
        move.playNoDuration();
      }
    });

    $('body').on('mouseup', function () {
      if(!move._game.isLocked()){
        move.stopPlay();
      }
    });
  }

  _turnLightOn() {
    $(this._buttonId).addClass(this._lightUpClass);
  }

  _turnLightOff() {
    $(this._buttonId).removeClass(this._lightUpClass);
  }
}

class MoveBuilder {

  withSoundPlayer(soundPlayer) {
    this._soundPlayer = soundPlayer;
    return this;
  }

  withGame(game) {
    this._game = game;
    return this;
  }

  withLightUpClass(lightUpClass) {
    this._lightUpClass = lightUpClass;
    return this;
  }

  withButtonId(buttonId) {
    this._buttonId = buttonId;
    return this;
  }

  build() {
    return new Move(this);
  }
}
