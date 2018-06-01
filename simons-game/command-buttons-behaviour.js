class StartBehaviour extends Behaviour {

  accept(jquerryObject) {
    return jquerryObject.attr('class').indexOf('round-button-start') >= 0;
  }

  addBehaviour(jquerryObject) {
    let game = this.getGame();
    addClickHandler(this, jquerryObject, function(){
      addTemporaryClass(jquerryObject, 'round-button-start-clicked', 100);
      game.start();
    });
  }
}

class StrictBehaviour extends Behaviour {

  accept(jquerryObject) {
    return jquerryObject.attr('class').indexOf('round-button-strict') >= 0;
  }

  addBehaviour(jquerryObject) {
    let game = this._game;
    addClickHandler(this, jquerryObject, function(){
      addTemporaryClass(jquerryObject, 'round-button-strict-clicked', 100);
      game.toggleStrictMode();
      if (game.strictModeEnabled()) {
        $('.strict-led').addClass('strict-led-enabled');
      } else {
        $('.strict-led').removeClass('strict-led-enabled');
      }
    });
  }

}


class OnOffBehaviour extends Behaviour {

  accept(jquerryObject) {
    return this._getSwitch(jquerryObject) != null;
  }

  addBehaviour(jquerryObject) {

    let game = this._game;
    let gameSwitch = this._getSwitch(jquerryObject);

    $(gameSwitch).on('click', function() {
      if ($(this).is(':checked')) {
        game.turnOn();
      } else {
        game.turnOff();
      }
    });

    // Add also behaviour for strict led.
  }

  _getSwitch(switchContainer) {
    return switchContainer.find('#game-switch').get(0);
  }
}

