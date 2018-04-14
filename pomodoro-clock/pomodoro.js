var DEFAULT_SESSION_LENGTH = 25;
var DEFAULT_BREAK_LENGTH = 5;

// State interface. no implementations
class State {

  constructor(pomodoroClock) {
    this._pomodoroClock = pomodoroClock;
  }

  pomodoroFinish(){ }
  pomodoroStart() { }
  pomodoroStop() { }
  pomodoroReset() { }
  pomodoroAdjust(timerComponent, direction) { }
}

class PomodoroStartedState extends State {
  pomodoroStop() {
    this._pomodoroClock.stopClock();
    enableCommandButtons();
    this._pomodoroClock.setState(this._pomodoroClock.getStopState());
  }
  pomodoroFinish(){
    disableStartStopButtons();
    disableTimerComponents();
    enableResetButton();
    this._pomodoroClock.setState(this._pomodoroClock.getFinishedState());
  }
}

class PomodoroStopedState extends State {
  pomodoroStart() {
    this._pomodoroClock.startClock();
    disableStartResetButtons();
    disableTimerComponents();
    this._pomodoroClock.setState(this._pomodoroClock.getStartState());
  }
  pomodoroReset() {
    this._pomodoroClock.reset();
    enableCommandButtons();
    enableTimerComponents();
    this._pomodoroClock.setState(this._pomodoroClock.getResetState());
  }
}

class PomodoroResetState extends State {
  pomodoroStart() {
    this._pomodoroClock.startClock();
    disableStartResetButtons();
    disableTimerComponents();
    this._pomodoroClock.setState(this._pomodoroClock.getStartState());
  }
  pomodoroReset() {
    this._pomodoroClock.reset();
  }

  pomodoroAdjust(timerComponent, direction) {
    if (direction === 'UP') {
      timerComponent.up();
    } else if (direction === 'DOWN') {
      timerComponent.down();
    }
  }
}

class PomodoroFinishedState extends State {
  pomodoroReset() {
    this._pomodoroClock.reset();
    enableCommandButtons();
    enableTimerComponents();
    this._pomodoroClock.setState(this._pomodoroClock.getResetState());
  }
}


class TimerComponent {
  constructor(componentClass, timerClockId, minValue, maxValue, defaultValue, defaultSessionLength) {
    this._componentClass = '.' + componentClass;
    this._maxValue = maxValue;
    this._minValue = minValue;
    this._defaultValue = defaultValue;
    this._timerClockId = '#' + timerClockId;
    this._defaultSessionLength = defaultSessionLength;
  }
  up() {
    var currentValue = this.getTimer().html();
    if (this._validUpperBoundValue(currentValue)) {
      this.getTimer().html(++currentValue);
      this._increaseTimerClock();
    }
  }
  down() {
    var currentValue = this.getTimer().html();
    if (this._validLowerBoundValue(currentValue)) {
      this.getTimer().html(--currentValue);
      this._decreaseTimerClock();
    }
  }

  reset() {
    this.getTimer().html(this._defaultValue);
    var dfs = this._defaultSessionLength;
    this._changeTimerClockValue(function (minute) {
      return dfs;
    });
  }

  _validUpperBoundValue(val) {
    return val < this._maxValue;
  }
  _validLowerBoundValue(val) {
    return val > this._minValue;
  }

  _increaseTimerClock() {
    this._changeTimerClockValue(function (minute) {
      return ++minute;
    });
  }

  _decreaseTimerClock() {
    this._changeTimerClockValue(function (minute) {
      return --minute;
    });
  }

  _changeTimerClockValue(changeFunction) {
    var timerClockValue = this._getTimerClock().html();
    if (timerClockValue) {
      var minute = timerClockValue.split(":")[0];
      var increasedValue = "" + changeFunction(minute) + ":00";
      this._getTimerClock().html(increasedValue);
    }
  }

  getTimer() {
    return $(this._componentClass).children(".timer");
  }

  getTimerValue(){
    this.getTimer().html();
  }

  _getTimerClock() {
    return $(this._timerClockId);
  }

}

class PomodoroClock {

  constructor(sessionComponent, breakComponent) {
    this._sessionComponent = sessionComponent;
    this._breakComponent = breakComponent;
    this._startedState = new PomodoroStartedState(this);
    this._stopedState = new PomodoroStopedState(this);
    this._resetState = new PomodoroResetState(this);
    this._finsihedState = new PomodoroFinishedState(this);
    this._currentState = this._resetState;
    this._onBreak = false;
  }

  reset() {
    this._sessionComponent.reset();
    this._breakComponent.reset();
    this._onBreak = false;
    $('.time-display-row').addClass('timer-start-state');
    $('.time-display-row').removeClass('timer-break-state');
    $('#timer-status').html('session');
    this.stopClock();
  }

  pomodoroStart() {
    this._currentState.pomodoroStart();
  }

  pomodoroStop() {
    this._currentState.pomodoroStop();
  }

  pomodoroReset() {
    this._currentState.pomodoroReset();
  }

  pomodoroAdjust(timerComponent, direction) {
    this._currentState.pomodoroAdjust(timerComponent, direction);
  }

  pomodoroFinished(){
    this._currentState.pomodoroFinish();
  }

  startClock() {
    var sc = this._startClock;
    var clockInstance = this;

    this._clockInterval = setInterval(function(){
      sc(clockInstance);
    }, 1000);
  }

  _startClock(clockInstance){
    var clockDisplay = $('#timer-clock');
    var seconds = convertTimeToSeconds(clockDisplay.html());

    if(clockInstance._onBreak){
      $('.time-display-row').fadeOut(500).fadeIn(500);
    }

    if (seconds > 0) {
      var newTime = convertSecondsToTime(--seconds);
      clockDisplay.html(newTime);
    } else if (!clockInstance._onBreak) {
      clockDisplay.html(clockInstance._breakComponent.getTimer().html() + ":00");
      $('.time-display-row').addClass('timer-break-state');
      $('.time-display-row').removeClass('timer-start-state');
      $('#timer-status').html('break!');
      clockInstance._onBreak = true;
    } else {
      clockInstance.stopClock();
      clockInstance.pomodoroFinished();
    }
  }

  stopClock() {
    clearInterval(this._clockInterval);
  }

  setState(state) {
    this._currentState = state;
  }

  getStartState() {
    return this._startedState;
  }

  getStopState() {
    return this._stopedState;
  }

  getResetState() {
    return this._resetState;
  }

  getFinishedState(){
    return this._finsihedState;
  }
}

// global functions 
function enableCommandButtons() {
  $('.btn-command').removeClass('btn-disabled');
}

function enableResetButton(){
  $('#reset-button').removeClass('btn-disabled');
}

function disableStartResetButtons() {
  $('#start-button').addClass('btn-disabled');
  $('#reset-button').addClass('btn-disabled');
}

function disableStartStopButtons(){
  $('#start-button').addClass('btn-disabled');
  $('#stop-button').addClass('btn-disabled');
}

function enableTimerComponents() {
  $('.time-settings-component').css('color', 'black');
}

function disableTimerComponents() {
  $('.time-settings-component').css('color', 'grey');
}

function convertSecondsToTime(seconds) {
  var min = parseInt(seconds / 60);
  var sec = parseInt(seconds % 60);
  var secWithLeadingZeros = sec < 10 ? ("0" + sec) : sec;
  return min + ":" + secWithLeadingZeros;
}

function convertTimeToSeconds(timeString) {
  var min = timeString.split(":")[0];
  var sec = timeString.split(":")[1];

  if (sec.length == 2 && sec.charAt(0) === '0') {
    sec = sec.charAt(1);
  }

  return parseInt(min) * 60 + parseInt(sec);
}

// constants & setup

var SESSION_TIMER = new TimerComponent('timer-session-component', 'timer-clock', 1, 60, 25, DEFAULT_SESSION_LENGTH);
var BREAK_TIMER = new TimerComponent('timer-break-component', null, 1, 15, 5, DEFAULT_SESSION_LENGTH);
var POMODORO_CLOCK = new PomodoroClock(SESSION_TIMER, BREAK_TIMER);

$(document).ready(function () {
  POMODORO_CLOCK.reset();
  // setup commands buttons
  $('#start-button').on('click', function () {
    POMODORO_CLOCK.pomodoroStart();
  });

  $('#stop-button').on('click', function () {
    POMODORO_CLOCK.pomodoroStop();
  });

  $('#reset-button').on('click', function () {
    POMODORO_CLOCK.pomodoroReset();
  });

  $('.timer-session-component .btn-timer-up').on('click', function () {
    POMODORO_CLOCK.pomodoroAdjust(SESSION_TIMER, 'UP');
  });

  $('.timer-session-component .btn-timer-down').on('click', function () {
    POMODORO_CLOCK.pomodoroAdjust(SESSION_TIMER, 'DOWN');
  });

  $('.timer-break-component .btn-timer-up').on('click', function () {
    POMODORO_CLOCK.pomodoroAdjust(BREAK_TIMER, 'UP');
  });

  $('.timer-break-component .btn-timer-down').on('click', function () {
    POMODORO_CLOCK.pomodoroAdjust(BREAK_TIMER, 'DOWN');
  });
});





