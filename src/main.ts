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
      fps: 60
    }
  },
  render: { pixelArt: true }
};

function hideScreens(){
  document?.querySelectorAll(".screen")?.forEach((screen) => {
    screen.classList.add("ocu");
  }); 
}

function hideLoader(){
  document?.querySelector(".loader")?.classList.add("ocu");
  document?.querySelector("#menu")?.classList.remove("ocu");
}

window.addEventListener("load", () => {

  let game = new Game(GameConfig);
  let gameia = new Game(GameConfigIA);
  gameia.pause();
  game.pause();
  
  document?.querySelector("#humanlnk")?.addEventListener("click", () => {
    hideScreens();
    document?.querySelector("#screen-game")?.classList.remove("ocu");
    gameia.pause();
    game.resume();
  });

  document?.querySelector("#ialnk")?.addEventListener("click", () => {
    hideScreens();
    document?.querySelector("#screen-game-ia")?.classList.remove("ocu");
    game.pause();
    gameia.resume();
  });

  document?.querySelector("#statslnk")?.addEventListener("click", () => {
    hideScreens();
    gameia.pause();
    game.pause();
    document?.querySelector("#stats")?.classList.remove("ocu");
  });

  setTimeout(() => { hideLoader(); }, 1000);

});