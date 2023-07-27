import "./style.css";
import "phaser";
import { GameScene } from "./components/human/game-scene";
import { Game } from "./game/game";
import { GameSceneIA } from "./components/ia/game-scene-ia";

let GameConfig: Phaser.Types.Core.GameConfig = {
  width: 400,
  height: 600,
  parent: "game",
  scene: [GameScene],
  input: {
    keyboard: true
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 350 },
      fps: 60
    }
  },
  render: { pixelArt: true }
};

let GameConfigIA: Phaser.Types.Core.GameConfig = {
  width: 400,
  height: 600,
  parent: "game-ia",
  scene: [GameSceneIA],
  input: {
    keyboard: true
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 350 },
      fps: 30
    }
  },
  render: { pixelArt: true }
};



window.addEventListener("load", () => {

  let game = new Game(GameConfig);

  let gameia = new Game(GameConfigIA);

});

