import { Bird } from "./bird";
import { Pipe } from "../common/pipe";


/**
 * Represents the game scene of the Flappy Bird game.
 */
export class GameScene extends Phaser.Scene {
  private bird!: Bird;
  private pipes!: Phaser.GameObjects.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.BitmapText;

  /**
   * Creates a new instance of the GameScene class.
   * @constructor
   */
  constructor() {
    super({
      key: "GameScene"
    });
  }

  /**
   * Initializes the game scene by setting the score to -1 in the registry.
   */
  init(): void {
    this.registry.set("score", -1);
  }

  /**
   * Preloads the assets needed for the game.
   */
  preload(): void {
    this.load.pack(
      "flappyBirdPack",
      "/pack.json",
      "flappyBirdPack"
    );
  }

  /**
   * Creates the game scene, including the background, score text, pipes, and bird.
   * Also sets up a timer to add new rows of pipes at a regular interval.
   */
  create(): void {
    this.background = this.add
      .tileSprite(0, 0, 400, 600, "background")
      .setOrigin(0, 0);

    this.scoreText = this.add
      .bitmapText(
        this.sys.canvas.width / 2 - 14,
        32,
        "atari",
        this.registry.values.score,
        28
      )
      .setDepth(2);

    this.pipes = this.add.group({ classType: Pipe });

    this.bird = new Bird(this, 50, 100, "bird");

    // *****************************************************************
    // TIMER
    // *****************************************************************
    this.addNewRowOfPipes();

    this.time.addEvent({
      delay: 1500,
      callback: this.addNewRowOfPipes,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Updates the game scene on each frame.
   * If the bird is not dead, updates the background, bird, and checks for collisions with pipes.
   * If the bird is dead, stops the pipes and restarts the scene if the bird falls off the screen.
   */
  update(): void {
    let _this = this;
    if (!this.bird.getDead()) {
      this.background.tilePositionX += 4;
      this.bird.update();
      this.physics.overlap(
        this.bird,
        this.pipes,
        function() {
          _this.bird.setDead(true);
        },
        undefined,
        this
      );
    } else {
      Phaser.Actions.Call(
        this.pipes.getChildren(),
        function(pipe:any) {
          if (pipe!=null){
            pipe.setVelocityX(0);
          }
        },
        this
      );

      
      if ( this.bird.y > this.sys.canvas.height) {
          this.scene.restart();
      }
    }
  }

  /**
   * Adds a new row of pipes to the game scene.
   * Updates the score and displays it on the screen.
   * Randomly picks a number between 1 and 5 to determine the position of the hole in the pipes.
   * Adds 6 pipes with one big hole at position hole and hole + 1.
   * @returns void
   */
  private addNewRowOfPipes(): void {
    // update the score
    this.registry.values.score += 1;
    this.scoreText.setText(this.registry.values.score);

    // randomly pick a number between 1 and 5
    let hole = Math.floor(Math.random() * 5) + 1;

    // add 6 pipes with one big hole at position hole and hole + 1
    for (let i = 0; i < 10; i++) {
      if (i !== hole && i !== hole + 1 && i !== hole + 2) {
        if (i === hole - 1) {
          this.addPipe(400, i * 60, 0);
        } else if (i === hole + 3) {
          this.addPipe(400, i * 60, 1);
        } else {
          this.addPipe(400, i * 60, 2);
        }
      }
    }
  }

  /**
   * Adds a new pipe to the game scene at the specified position.
   * @param x The x-coordinate of the pipe's position.
   * @param y The y-coordinate of the pipe's position.
   * @param frame The frame number of the pipe's sprite.
   */
  private addPipe(x: number, y: number, frame: number): void {
    // create a new pipe at the position x and y and add it to group
    this.pipes.add(
      new Pipe(this, x , y, "pipe", frame)
    );
  }

}
