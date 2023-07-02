import { Pipe } from "../common/pipe";
import { BirdIA } from "./bird-ia";


export class GameSceneIA extends Phaser.Scene {
  private birds!: BirdIA[];
  private pipes!: Phaser.GameObjects.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.BitmapText;
  private birdsAliveText!: Phaser.GameObjects.BitmapText;
  private firstTopPipe!:Pipe;
  private firstBottomPipe!:Pipe;
  private nextTopPipe!:Pipe;
  private nextBottomPipe!:Pipe;
  private changePipeDelay!:number;

  constructor() {
    super({
      key: "GameSceneIA"
    });
  }

  init(): void {
    this.registry.set("score", -1);
    this.registry.set("birdsAlive", -1);
    this.birds = [];
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
      .tileSprite(0, 0, 400, 600, "background")
      .setOrigin(0, 0);

    this.scoreText = this.add
      .bitmapText(
        this.sys.canvas.width / 2 - 14,
        30,
        "font",
        this.registry.values.score
      )
      .setDepth(2);

      this.birdsAliveText = this.add
      .bitmapText(
        this.sys.canvas.width / 2 - 14,
        60,
        "font",
        this.registry.values.birdsAlive
      )
      .setDepth(2);


    

    this.pipes = this.add.group({ classType: Pipe });

    for (var i:number=0; i<50; i++){
      this.birds.push(
        new BirdIA(this, 50, 100, "bird")
      )    
    }    
    this.registry.set("birdsAlive", 50);
    // *****************************************************************
    // TIMER
    // *****************************************************************
    this.addNewRowOfPipes();
    this.firstBottomPipe = this.nextBottomPipe;
    this.firstTopPipe = this.nextTopPipe;    


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

    if (_this.nextTopPipe != this.firstTopPipe){
      _this.changePipeDelay = 0;
    }

    if ( this.changePipeDelay == 0 ){
      _this.firstTopPipe = _this.nextTopPipe;    
      _this.firstBottomPipe = _this.nextBottomPipe;
    }
    else{
      this.changePipeDelay -= 1;
    }


    if (this.birdsAreAlive()) {
      this.birds.forEach(function(bird:BirdIA){
        bird.update(_this.firstTopPipe, _this.firstBottomPipe);
        _this.physics.overlap(
            bird,
            _this.pipes,
            function() {
              bird.setDead(true);
            },
            undefined,
            _this
          );
          
          if (bird.y > _this.sys.canvas.height ||
              bird.y < -1
            ) {
            bird.setDead(true);
          }

      });
      this.birdsAliveText.setText(this.registry.values.birdsAlive);
    } 
    if (!this.birdsAreAlive()){
        Phaser.Actions.Call(
          this.pipes.getChildren(),
          function(pipe:any) {
            if (pipe!=null){
              pipe.setVelocityX(0);
            }
          },
          this
        );
        _this.printReport();
        _this.scene.restart();
    }
  }

  private printReport(){
    for (var index=0 ; index< this.birds.length; index++){
      if (this.birds[index].getFitness() > 200){
        console.info(index + 1, this.birds[index].print());
      }
    }
  }

  private birdsAreAlive():boolean{
    var alive: boolean = false;
    var numAlive: number = 0;
    for (var index=0 ; index< this.birds.length; index++){
      if ( !this.birds[index].getDead()){
          numAlive += 1;
      }
    }
    alive = (numAlive > 0);
    
    this.registry.set("birdsAlive", numAlive);
    return alive;
  }

  public addBird(): BirdIA{
    return new BirdIA(this, 50, 100, "birdIA", undefined, -1, -1);
  }

  private addNewRowOfPipes(): void {
    // update the score
    this.registry.values.score += 1;
    this.scoreText.setText(this.registry.values.score);

    // randomly pick a number between 1 and 5
    let hole = Math.floor(Math.random() * 5) + 1;

    // add 6 pipes with one big hole at position hole and hole + 1 and hole +2
    for (let i = 0; i < 10; i++) {
      if (i !== hole && i !== hole + 1 && i !== hole + 2) {
        if (i === hole - 1) {
          this.nextTopPipe = this.addPipe(400, i * 60, 0);
        } else if (i === hole + 3) {
          this.nextBottomPipe = this.addPipe(400, i * 60, 1);
        } else {
          this.addPipe(400, i * 60, 2);
        }
      }
    }
  }

  private addPipe(x: number, y: number, frame: number): Pipe {
    // create a new pipe at the position x and y and add it to group
    let ret = new Pipe(this, x , y, "pipe", frame)
    this.pipes.add(ret);  
    return ret;
  }
}
