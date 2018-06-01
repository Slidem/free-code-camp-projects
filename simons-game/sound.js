var audioContext;
function initAudioContext() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  catch (e) {
    alert('Web Audio API is not supported in this browser');
  }
}

class SoundPlayer {
  
  constructor(soundFrequency){
    this._soundFrequency = soundFrequency;
  }

  play(stopCondition) {
    let soundPlayer = this;
    soundPlayer.playWithCallback(stopCondition, null);
  }

  playWithCallBack(stopCondition, callBackFunction){
    let oscillator = audioContext.createOscillator();

    oscillator.connect(audioContext.destination);
    oscillator.frequency.value = this._soundFrequency;
    oscillator.type = 'sine';

    oscillator.start();

    let stopId = setInterval(function(){
      if(stopCondition()){
        oscillator.stop(audioContext.currentTime + 0.1); 
        if(callBackFunction !== null || callBackFunction !== undefined){
          callBackFunction();
        }
        clearInterval(stopId);
      }
    }, 5);
  }
}





