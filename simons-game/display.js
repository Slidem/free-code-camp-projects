class Display {

  constructor(displayId) {
    this._displayId = '#' + displayId;
  }

  clearDisplay() {
    this._displayText('');
  }

  display(text) {
    this._displayText(text);
  }

  displayAndBlink(displayOptions) {
    let startTime = new Date().getTime();
    let displayTextFlag = false;
    let interval = 0;
    let actualDisplay = this;
    let stopSound = false;
    let blinkId = setInterval(function(){
      let currentTime = new Date().getTime();
      let elapsedTime = currentTime - startTime;
      let elapsedInterval = Math.floor(elapsedTime / displayOptions.getBlinkFrequency());
      if( elapsedInterval != interval){
        if(displayTextFlag){
          stopSound = true;
          actualDisplay.display(displayOptions.getText());
          if(displayOptions.getBlinkSound() !== undefined && displayOptions.getBlinkSound() !== null){
            displayOptions.getBlinkSound().playWithCallBack(()=> stopSound, () => {});
          }
        } else {
          actualDisplay.clearDisplay();
          stopSound = true;
        }
        displayTextFlag = !displayTextFlag;
        interval++;
      }

      if(displayOptions.getStopFlagSupplier()){
        displayOptions.executeDisplayFinishedObserver();
        clearInterval(blinkId);
      }
      
    }, 20);
  }

  _displayText(text) {
    $(this._displayId).html(text);
  }
}

class DisplayOptions {

  constructor(text, blinkFrequencyInMillis, stopFlagSupplier, displayFinishedObserver, blinkSound) {
    this._text = text;
    this._blinkFrequencyInMillis = blinkFrequencyInMillis;
    this._stopFlagSupplier = stopFlagSupplier;
    this._displayFinishedObserver = displayFinishedObserver;
    this._blinkSound = blinkSound;
  }

  getText(){
    return this._text;
  }

  getBlinkFrequency() {
    return this._blinkFrequencyInMillis;
  }

  executeDisplayFinishedObserver() {
    return this._displayFinishedObserver();
  }

  getStopFlagSupplier(){
    return this._stopFlagSupplier();
  }

  getBlinkSound(){
    return this._blinkSound;
  }

}

class DisplayOptionsBuilder {

  constructor() { }

  withBlinkFrequencyInMillis(blinkFrequencyInMillis) {
    this._blinkFrequencyInMillis = blinkFrequencyInMillis;
    return this;
  }

  withStopFlagSupplier(stopFlagSupplier) {
    this._stopFlagSupplier = stopFlagSupplier;
    return this;
  }

  withDisplayFinishedObserver(displayFinishedObserver) {
    this._displayFinishedObserver = displayFinishedObserver;
    return this;
  }

  withBlinkSound(sound){
    this._blinkSound = sound;
    return this;
  }

  withText(text){
    this._text = text;
    return this;
  }

  build() {
    return new DisplayOptions(this._text, this._blinkFrequencyInMillis, this._stopFlagSupplier, this._displayFinishedObserver, this._blinkSound);
  }
}
