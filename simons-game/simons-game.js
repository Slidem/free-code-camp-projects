$(document).ready(function(){
  initAudioContext();

  let game = new Game();

  new ButtonsBehaviourBuilder()
    .withBehaviour(new StartBehaviour(game))
    .withBehaviour(new StrictBehaviour(game))
    .withBehaviour(new OnOffBehaviour(game))
    .withButtonGroupClass('command')
    .build()
    .initButtons();
});