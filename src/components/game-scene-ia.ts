import { Bird } from "./bird";
import { Pipe } from "./pipe";


export class GameSceneIA extends Phaser.Scene {
  private birds!: Bird[];
  private pipes!: Phaser.GameObjects.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.BitmapText;

  constructor() {
    super({
      key: "GameScene"
    });
    this.birds = [];
  }

  init(): void {
    this.registry.set("score", -1);
  }

  preload(): void {
    this.load.pack(
      "flappyBirdPack",
      "./src/assets/pack.json",
      "flappyBirdPack"
    );
  }

  create(): void {
    this.background = this.add
      .tileSprite(0, 0, 390, 600, "background")
      .setOrigin(0, 0);

    this.scoreText = this.add
      .bitmapText(
        this.sys.canvas.width / 2 - 14,
        30,
        "font",
        this.registry.values.score
      )
      .setDepth(2);

    this.pipes = this.add.group({ classType: Pipe });

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

  update(): void {
    let _this = this;
    this.background.tilePositionX += 4;
    if (this.birdsAreAlive()) {
      this.birds.forEach(function(bird:Bird){
        bird.update();
        _this.physics.overlap(
            bird,
            _this.pipes,
            function() {
              bird.setDead(true);
            },
            undefined,
            _this
          );
          
          if (bird.y > _this.sys.canvas.height) {
            bird.setDead(true);
          }
    

      });
    } 
    // if (!this.birdsAreAlive()){
        // Phaser.Actions.Call(
        //   this.pipes.getChildren(),
        //   function(pipe:any) {
        //     if (pipe!=null){
        //       pipe.setVelocityX(0);
        //     }
        //   },
        //   this
        // );
        // _this.scene.restart();
    // }
  }

  private birdsAreAlive():boolean{
    var alive: boolean = false;
    for (var index=0 ; index< this.birds.length; index++){
      if (!this.birds[index].getDead()){
          alive= true;
          continue;
      }
    }
    return alive;
  }

  public addBird(): Bird{
    return new Bird(this, 50, 100, "bird");
  }

  private addNewRowOfPipes(): void {
    //
    console.info("Adding more pipes");
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

  private addPipe(x: number, y: number, frame: number): void {
    // create a new pipe at the position x and y and add it to group
    this.pipes.add(
      new Pipe(this, x , y, "pipe", frame)
    );
  }
}
