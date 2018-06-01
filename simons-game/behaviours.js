class ButtonsBehaviour {

  constructor(builder) {
    this._buttonGroupClass = builder._buttonGroupClass;
    this._behaviours = builder._behaviours;
  }

  initButtons() {
    validateField(this._buttonGroupClass, "buttonGroupClass");
    validateField(this._behaviours, "behaviours");
    let behaviours = this.getBehaviours();
    $('.' + this.getGroupClass()).each(function() {
      let button = $(this);
      behaviours
        .filter(behaviour => behaviour.accept(button))
        .forEach(behaviour => behaviour.addBehaviour(button));
    });
  }

  getBehaviours() {
    return this._behaviours;
  }

  getGroupClass() {
    return this._buttonGroupClass;
  }
}

class ButtonsBehaviourBuilder {

  constructor() {
    this._behaviours = [];
  }

  withButtonGroupClass(buttonGroupClass) {
    this._buttonGroupClass = buttonGroupClass;
    return this;
  }

  withBehaviour(behaviour) {
    this._behaviours.push(behaviour);
    return this;
  }

  build() {
    return new ButtonsBehaviour(this);
  }

}

class Behaviour {

  constructor(game){
    validateField(game, 'game');
    this._game = game;
  }

  accept(jquerryObject) {
  }

  addBehaviour(jquerryObject) {
  }

  getGame(){
    return this._game;
  }
}

function addClickHandler(behaviour, jquerryObject, handler){
  jquerryObject.on('click', function(){
    let game = behaviour.getGame();
    if(game.isOn()){
      handler();
    }
  });
}