import "phaser";
import { GameScene } from "./components/game-scene";
import { Game } from "./game/game";

let GameConfig: Phaser.Types.Core.GameConfig = {
  width: 390,
  height: 600,
  parent: "game",
  scene: [GameScene],
  input: {
    keyboard: true
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 }
    }
  },
  render: { pixelArt: true }
};

window.addEventListener("load", () => {

  let game = new Game(GameConfig);
  
});

