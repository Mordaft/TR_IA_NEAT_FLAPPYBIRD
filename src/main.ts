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

function hideScreens(){
  document?.querySelectorAll(".screen")?.forEach((screen) => {
    screen.classList.add("ocu");
  }); 
}

window.addEventListener("load", () => {

  let game = new Game(GameConfig);
  let gameia = new Game(GameConfigIA);

  
  document?.querySelector("#humanlnk")?.addEventListener("click", () => {
    hideScreens();
    document?.querySelector("#game")?.classList.remove("ocu");
    gameia.pause();
    game.resume();
  });

  document?.querySelector("#ialnk")?.addEventListener("click", () => {
    hideScreens();
    document?.querySelector("#game-ia")?.classList.remove("ocu");
    game.pause();
    gameia.resume();
  });


});