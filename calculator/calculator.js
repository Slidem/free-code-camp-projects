// **************************** OPERATIONS CLASSES

class Operation {

  constructor() {
    if (arguments.length === 1) {
      this.opA = arguments[0];
      this.opB = null;
    } else if(arguments.length === 0){
      var a = arguments[0];
      var b = arguments[1];

      if (a instanceof Operation) {
        this.opA = a.getResult;
      } else {
        this.opA = a;
      }
      this.opB = b;
    }
  }

  setSecondOperand(opB){
    if(isNaN(opB)){
      throw "Operand must be a valid number";
    }
    this.opB = opB;
  }

  isEmpty(){
    return this.opA == null;
  }

  computeFinalResult(){
    var result = this.executeOperation();
    displayNumber(result);
  }

  chainOperation(secondOperand, type){
    this.setSecondOperand(secondOperand);
    var computed = this.executeOperation();
    clearDisplay();
    return getOperation(type, computed);
  }
  executeOperation() {
    // Do nothing. Overriden in child classes
  }
}

class Addition extends Operation {
  executeOperation() {
    return this.opA + this.opB;
  }
}

class Substraction extends Operation {
  executeOperation(){
    return this.opA - this.opB;
  }
}

class Multiplication extends Operation {
  executeOperation(){
    return this.opA * this.opB;
  }
}

class Division extends Operation {
  executeOperation() {
     if (this.opB == 0 ){
       throw "Cannot divide by 0";
     }  
     return this.opA / this.opB;
  }
}

// ******************************* CONSTANTS

var CLICK_SOUND_URL = 'http://res.cloudinary.com/slidem/video/upload/v1522144910/click_pxngrg.mp3';
var DISPLAY_MAX_DIGITS = 20;
var OPERATION = new Operation(null);
var Operations = {
  "ADD" : "ADD",
  "SUBSTRACT" : "SUBSTRACT",
  "DIVIDE" : "DIVIDE",
  "MULTIPLY" : "MULTIPLY"
};

// ******************************************

$(document).ready(function () {
  setupButtonBehaviours();
});


function setupButtonBehaviours() {
  setupClickStyle();
  setupClickSound();
  setupClickAction();
}

function setupClickStyle() {
  clickStyle('calculator-command-button', 'command-clicked');
  clickStyle('cancel-button', 'cancel-button-clicked');
}

function clickStyle(targetClass, styleClass) {
  $('.' + targetClass).on('click', function () {
    $(this).addClass(styleClass).delay(150).queue(function (next) {
      $(this).removeClass(styleClass);
      next();
    });
  });
}

function setupClickSound() {
  $('.calculator-button').on('click', function () {
    var audio = new Audio(CLICK_SOUND_URL);
    audio.play();
  });
}

function setupClickAction() {
  setupDigits();
  setupCancelButton();
  setupOperationsButtons();
}

function setupDigits() {
  $('.digit-button').on('click', function () {
    addDigit(this);
  });
}

function addDigit(button) {
  var calculatorDisplay = $('.calculator-display');

  var currentValue = String(calculatorDisplay.html());
  var digitToAdd = String($(button).html());

  if (!validDigit(currentValue, digitToAdd)) {
    return;
  }

  var toDisplay = '';

  if (currentValue === '0' && digitToAdd === '.') {
    toDisplay = '0.';
  } else if (currentValue === '0') {
    toDisplay = digitToAdd;
  } else {
    toDisplay = currentValue + digitToAdd;
  }

  if (toDisplay !== '0') {
    $('.cancel-button').html('C');
  }

  displayNumber(toDisplay);
}


function validDigit(currentValue, digitToAdd) {
  if (currentValue.length === DISPLAY_MAX_DIGITS) {
    return false;
  }

  if (digitToAdd === '.' && currentValue.indexOf('.') !== -1) {
    return false;
  }

  if (displayOnError()){
    return false;
  }

  return true;
}

function setupCancelButton() {
  $('.cancel-button').on('click', function () {
    var cancelButton = $(this);
    var btnValue = cancelButton.html();
    if ('C' === String(btnValue)) {
      cancelButton.html('CE');
      displayNumber('0')
    } else {
      clearOperations();
    }
  });
}

function clearOperations() {
  OPERATION = new Operation();
}

function addOperation(type){

  if(OPERATION.isEmpty()){
    OPERATION = getOperation(type, getCurrentDisplay());
    clearDisplay();
  } else {
    OPERATION = OPERATION.chainOperation(getCurrentDisplay(), type);    
  }
}

function getResult(){
  if(OPERATION.isEmpty()){
    return;
  }
  OPERATION.setSecondOperand(getCurrentDisplay());
  OPERATION.computeFinalResult();
  OPERATION = new Operation();
} 

function getOperation(type, firstOp){
  switch(type){
    case Operations.ADD:
      return new Addition(firstOp);
    case Operations.SUBSTRACT:
      return new Substraction(firstOp);  
    case Operations.MULTIPLY:
      return new Multiplication(firstOp);
    case Operations.DIVIDE:
      return new Division(firstOp);
  }
}

function getCurrentDisplay(){
  return Number($('.calculator-display').html());
}

function clearDisplay(){
  displayNumber('0');
}

function setupOperationsButtons (){
  setupOperationButton('divide-button', function(){
    addOperation(Operations.DIVIDE);
  });
  setupOperationButton('multiply-button', function(){
    addOperation(Operations.MULTIPLY);
  });
  setupOperationButton('substract-button', function(){
    addOperation(Operations.SUBSTRACT);
  });
  setupOperationButton('add-button', function(){
    addOperation(Operations.ADD);
  });
  setupOperationButton('equals-button', function(){
    getResult();
  });
}


function setupOperationButton(buttonId, clickFunction){
    $('#' + buttonId).on('click', function(){
      if(displayOnError()){
        return;
      } 
      clickFunction();
    });
}

function displayOnError(){
  return $('.calculator-display').html() === 'E'; 
}

function displayNumber(digit){
  if(String(digit).length > DISPLAY_MAX_DIGITS){
    displayError();
    return;
  }

  $('.calculator-display').css('color', 'black');
  $('.calculator-display').html(digit);  
}

function displayError(){
  $('.calculator-display').css('color', 'red');
  $('.calculator-display').html("E");  
}
