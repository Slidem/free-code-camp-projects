
function validateField(field, fieldName){
  if(!field){
    throw "Field [" + fieldName + "] cannot be null";
  }
}

function validateArray(array, fieldName, shouldBeEmpty){
  validateField(array, fieldName);
  if(!shouldBeEmpty && array.length === 0){
    throw "Array cannot be empty";
  }
}

function addTemporaryClass(jquerryObject, className, delay){
  jquerryObject.addClass(className).delay(delay).queue(function(){
    $(this).removeClass(className).dequeue();
});
}

class NullableObject{

  constructor(value){
    this._value = value;
  }

  static of(value){
    return new NullableObject(value);
  }

  get(){
    return this._value;
  }

  isPresent(){
    return this._value != null && typeof this._value !== 'undefined';
  }
  
}