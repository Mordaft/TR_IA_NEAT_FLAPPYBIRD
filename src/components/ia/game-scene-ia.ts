/**
 * @fileoverview This file contains the GameSceneIA class, which is responsible for managing the game scene for the Flappy Bird game with AI.
 * It imports the Neat, methods, and architect modules from the neataptic library, as well as the Pipe and BirdIA classes from other files.
 * It also defines several constants and variables, including the number of birds, mutation rate, input and output sizes, elitism percentage, and the brain.
 * The GameSceneIA class extends the Phaser.Scene class and contains methods for initializing, preloading, creating, updating, and calculating fitness.
 * It also contains a private graph variable for displaying the fitness graph.
 */
import { Pipe } from "../common/pipe";
import { BirdIA } from "./bird-ia";
import { Graph } from "../graph/graph";
import { Brain } from "./brain";


export const BIRD_AMOUNT: number = 100;
export const PIPE_BLOCK_SIZE: number = 60;

/**
 * Represents the game scene for the IA version of Flappy Bird.
 */
export class GameSceneIA extends Phaser.Scene {

  private birds!: BirdIA[];
  private pipes!: Phaser.GameObjects.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.BitmapText;
  private birdsAliveText!: Phaser.GameObjects.BitmapText;
  private generationText!: Phaser.GameObjects.BitmapText;
  private firstTopPipe!: Pipe;
  private firstBottomPipe!: Pipe;
  private nextTopPipe!: Pipe;
  private nextBottomPipe!: Pipe;
  private currentScore!: number;
  private hiScore!: number;
  private hiFitness!: number;
  private brain!: Brain;
  private graph: Graph;


  /**
   * Represents the game scene for the IA version of Flappy Bird.
   * @constructor
   */
  constructor() {
    super({
      key: "GameSceneIA"
    });
    this.hiFitness = 0;

    this.brain = new Brain(this.fitness, BIRD_AMOUNT);

    this.graph = new Graph("graph");

    this.hiScore = 0;

  }

  /**
   * Initializes the game scene by setting the initial values for the score, number of birds alive, and generation.
   * Also initializes the birds array.
   */
  init(): void {
    this.registry.set("score", -1);
    this.registry.set("birdsAlive", -1);
    this.registry.set("generation", -1);
    this.currentScore = 0;
    this.birds = [];

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
   * Creates the game scene and initializes all the necessary components, including the background, score text, birds alive text, generation text, pipes, and birds. 
   * Also sets up the evolution process for the neural network population and the timer for adding new rows of pipes.
   * @returns void
   */
  create(): void {

    //console.info("create ", this.brain.generation, this.fitness());

    this.background = this.add
      .tileSprite(0, 0, 400, 600, "background")
      .setOrigin(0, 0);

    this.scoreText = this.add
      .bitmapText(
        // this.sys.canvas.width / 2 - 14,
        14,
        2,
        "atari",
        this.registry.values.score,
        20
      )
      .setDepth(2);

    this.birdsAliveText = this.add
      .bitmapText(
        // this.sys.canvas.width / 2 - 14,
        14,
        32,
        "atari",
        this.registry.values.birdsAlive,
        20
      )
      .setDepth(2);

    let currentGeneration = 'Generation: ' + this.brain.getGeneration();
    this.generationText = this.add
      .bitmapText(
        // this.sys.canvas.width / 2 - 14,
        14,
        62,
        "atari",
        currentGeneration,
        20
      )
      .setDepth(2);


    this.birds = [];
    let population = this.brain.getPopulation();
    for (var i: number = 0; i < BIRD_AMOUNT; i++) {
      this.birds.push(
        new BirdIA(i, population[i], this, 50, 350, "bird")
      )
    }




    this.pipes = this.add.group({ classType: Pipe });
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

  /**
    * Calculates the fitness of the birds in the game scene.
    * @returns The total fitness of all birds in the game scene.
    */
  fitness(): number {
    let fitness = 0;
    if (this.birds != undefined) {
      this.birds.forEach(function (bird: BirdIA) {
        let birdFitness = bird.getFitness();
        fitness += birdFitness;
      });
    }
    return fitness;
  }

  /**
   * Updates the game scene. This method is called every frame while the scene is running.
   * It updates the position of the background, the pipes, and the birds. It also checks for collisions
   * between the birds and the pipes, and updates the score and generation information when necessary.
   * If all birds are dead, it prints a report and restarts the scene.
   */
  update(): void {
    let _this = this;
    this.background.tilePositionX += 2;

    if (this.birdsAreAlive()) {
      this.birds.forEach(function (bird: BirdIA) {

        if (bird.x >= _this.firstTopPipe.x + 60) {
          _this.firstTopPipe = _this.nextTopPipe;
          _this.firstBottomPipe = _this.nextBottomPipe;
        }

        bird.update(_this.firstTopPipe, _this.firstBottomPipe);
        _this.physics.overlap(
          bird,
          _this.pipes,
          function () {
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
      this.birdsAliveText.setText('Birds Alive: ' + this.registry.values.birdsAlive.toString());
    }
    if (!this.birdsAreAlive()) {
      Phaser.Actions.Call(
        this.pipes.getChildren(),
        function (pipe: any) {
          if (pipe != null) {
            pipe.setVelocityX(0);
          }
        },
        this
      );
      _this.printReport();
      // this.brain.createPopulation();
      // let generation = this.brain.getGeneration();  
      // this.registry.values.generation = generation.toString();
      // this.generationText.setText(this.registry.values.generation);
      _this.scene.restart();
    }
  }

  /**
   * Prints a report of the current generation's fitness and the highest fitness achieved so far.
   * Also displays a graph of the neural network of the bird with the highest fitness.
   */
  private printReport() {

    //console.info("End life of generation " + this.brain.generation + " fitness " + this.fitness() + " hiFitness " + this.hiFitness);
    let _this = this;
    let hiFitnessIndex = -1;
    let index = 0;
    if (this.birds != undefined) {
      let birdFitness = 0;
      this.birds.forEach(function (bird: BirdIA) {
        birdFitness = bird.getFitness();
        // console.info("Bird fitnes" , birdFitness, _this.hiFitness, hiFitnessIndex, index);
        if (_this.hiFitness < birdFitness) {
          _this.hiFitness = birdFitness;
          hiFitnessIndex = index;
        }
        index++;
      });
    }

    
    if (hiFitnessIndex >= 0) {
      console.info('printReport population fitness', this.hiFitness, hiFitnessIndex);
      let mygraph = this.brain.getGraph(hiFitnessIndex);
      this.graph.graphIt(mygraph);
    }

  }


  /**
   * Checks if any birds are still alive in the game.
   * @returns {boolean} True if at least one bird is alive, false otherwise.
   */
  private birdsAreAlive(): boolean {
    var alive: boolean = false;
    var numAlive: number = 0;
    for (var index = 0; index < this.birds.length; index++) {
      if (!this.birds[index].getDead()) {
        numAlive += 1;
      }
    }
    alive = (numAlive > 0);

    this.registry.set("birdsAlive", numAlive);
    return alive;
  }

  /**
   * Adds a new row of pipes to the game scene and updates the score.
   * Randomly picks a number between 1 and 5 to determine the position of the hole in the pipes.
   * Adds 6 pipes with one big hole at position hole and hole + 1 and hole +2.
   */
  private addNewRowOfPipes(): void {
    // update the score
    this.currentScore += 1;
    if (this.currentScore > this.hiScore) {
      this.hiScore = this.currentScore;
    }
    let totalScoreText = 'Score: ' + this.currentScore.toString() + " Max: (" + this.hiScore + ")";
    this.scoreText.setText(totalScoreText);

    // randomly pick a number between 1 and 5
    let hole = Math.floor(Math.random() * 5) + 1;

    // add 6 pipes with one big hole at position hole and hole + 1 and hole +2
    for (let i = 0; i < 10; i++) {
      if (i !== hole && i !== hole + 1 && i !== hole + 2) {
        if (i === hole - 1) {
          this.nextTopPipe = this.addPipe(400, i * PIPE_BLOCK_SIZE, 0);
        } else if (i === hole + 3) {
          this.nextBottomPipe = this.addPipe(400, i * PIPE_BLOCK_SIZE, 1);
        } else {
          this.addPipe(400, i * PIPE_BLOCK_SIZE, 2);
        }
      }
    }
  }

  /**
   * Adds a new pipe to the game scene at the specified position and frame.
   * @param x The x-coordinate of the pipe's position.
   * @param y The y-coordinate of the pipe's position.
   * @param frame The frame number of the pipe's sprite.
   * @returns The newly created Pipe object.
   */
  private addPipe(x: number, y: number, frame: number): Pipe {
    // create a new pipe at the position x and y and add it to group
    let ret = new Pipe(this, x, y, "pipe", frame)
    this.pipes.add(ret);
    return ret;
  }

}
