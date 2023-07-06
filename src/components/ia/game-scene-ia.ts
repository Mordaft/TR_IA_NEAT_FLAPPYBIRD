import { Neat, methods, architect } from "neataptic";
import { Pipe } from "../common/pipe";
import { BirdIA } from "./bird-ia";
import { Graph } from "../graph/graph";


export const BIRD_AMOUNT:number = 100;
export const MUTATION_RATE:number = 0.5;
export const START_HIDDEN_SIZE:number = 0;
export const INPUTS_SIZE:number = 3;
export const OUTPUTS_SIZE:number = 1;
export const ELITISM_PERCENT:number = 0.10;


export class GameSceneIA extends Phaser.Scene { 

  private birds!: BirdIA[];
  private pipes!: Phaser.GameObjects.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.BitmapText;
  private birdsAliveText!: Phaser.GameObjects.BitmapText;
  private generationText!: Phaser.GameObjects.BitmapText;
  private firstTopPipe!:Pipe;
  private firstBottomPipe!:Pipe;
  private nextTopPipe!:Pipe;
  private nextBottomPipe!:Pipe;
  private changePipeDelay!:number;
  private brain:Neat;
  private hiScore!:number;
  private graph: Graph;

  inputs =  {
    myPositionY: 100,
    distanceToTopPipe: 250,
    distanceToBottonPipe: 250,
    distanceXToPipes: 250,
    myVelocity: 100
  }

  constructor() {
    super({
      key: "GameSceneIA"
    });

    this.graph = new Graph("graph");

    this.hiScore = 0;

    this.brain = new Neat(5, 1 , null, {
        mutation: [
          methods.mutation.ADD_NODE,
          methods.mutation.SUB_NODE,
          methods.mutation.ADD_CONN,
          methods.mutation.SUB_CONN,
          methods.mutation.MOD_WEIGHT,
          methods.mutation.MOD_BIAS,
          methods.mutation.MOD_ACTIVATION,
          methods.mutation.ADD_GATE,
          methods.mutation.SUB_GATE,
          methods.mutation.ADD_SELF_CONN,
          methods.mutation.SUB_SELF_CONN,
          methods.mutation.ADD_BACK_CONN,
          methods.mutation.SUB_BACK_CONN
        ],
        popsize: BIRD_AMOUNT,
        mutationRate: MUTATION_RATE,
        elitism: Math.round(ELITISM_PERCENT * BIRD_AMOUNT),
        network: architect.Random( INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE , null)
      }
    )
      

  }

  init(): void {
    this.registry.set("score", -1);
    this.registry.set("birdsAlive", -1);
    this.registry.set("generation", -1);
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
        2,
        "atari",
        this.registry.values.score,
        28
      )
      .setDepth(2);

      this.birdsAliveText = this.add
      .bitmapText(
        this.sys.canvas.width / 2 - 14,
        32,
        "atari",
        this.registry.values.birdsAlive,
        28
      )
      .setDepth(2);

      this.generationText = this.add
      .bitmapText(
        this.sys.canvas.width / 2 - 14,
        62,
        "atari",
        this.brain.generation,
        28
      )
      .setDepth(2);

    

    this.pipes = this.add.group({ classType: Pipe });


    this.brain.sort();

    // let newPopulation = [];
    // for (var i:number=0; i < Math.abs(BIRD_AMOUNT * ELITISM_PERCENT) ; i++){
    //   let genome = this.brain.population[i]; 
    //   newPopulation.push(genome); 
    // }


    // for (var i:number=0; i < (BIRD_AMOUNT - Math.abs(BIRD_AMOUNT * ELITISM_PERCENT)) ; i++){
    //   let genome = this.brain.getOffspring();
    //   newPopulation.push(genome); 
    // }


    // this.brain.population = newPopulation;
    this.brain.mutate();
    this.brain.evolve();
    this.brain.generation++;

    for (var i:number=0; i < BIRD_AMOUNT; i++){ 
      this.birds.push(
        new BirdIA(this.brain.population[i], this, 50, 350, "bird")
      )

    }    
    this.registry.set("birdsAlive", BIRD_AMOUNT);
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
        this.registry.values.generation = this.brain.generation;
        this.generationText.setText(this.registry.values.generation);
        _this.scene.restart();
    }
  }

  private printReport(){

    let mygraph = this.brain.population[0].graph(300, 300);
    this.graph.graphIt(mygraph);
    
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

  private addNewRowOfPipes(): void {
    // update the score
    this.registry.values.score += 1;
    if (this.registry.values.score > this.hiScore ){
      this.hiScore = this.registry.values.score;
    }
    let totalScoreText = this.registry.values.score + " (" + this.hiScore + ")";
    this.scoreText.setText(totalScoreText);

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
