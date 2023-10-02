import { Network } from "neataptic";
import { Pipe } from "../common/pipe";
import { PIPE_BLOCK_SIZE } from "./game-scene-ia";

/**
 * Represents a bird controlled by an artificial neural network.
 */
export class BirdIA extends Phaser.Physics.Arcade.Sprite {
  private isDead: boolean;
  private fitness!:number;
  private brain: Network;
  private populationIndex: number;

  /**
   * Gets whether the bird is dead or not.
   * @returns A boolean indicating whether the bird is dead or not.
   */
  public getDead(): boolean {
    return this.isDead;
  }

  /**
   * Sets whether the bird is dead or not.
   * @param dead A boolean indicating whether the bird is dead or not.
   */
  public setDead(dead: boolean): void {
    if (this.isDead ){
      return;
    }
    this.isDead = dead;
    //this.fitness-=1;
    this.setVisible(false);
    this.setActive(false);
  }

  /**
   * Creates a new instance of BirdIA.
   * @param genome The genome of the bird's neural network.
   * @param scene The scene where the bird will be displayed.
   * @param x The x coordinate of the bird's initial position.
   * @param y The y coordinate of the bird's initial position.
   * @param texture The texture key of the bird's sprite.
   * @param frame The frame key of the bird's sprite.
   */
  constructor(index: number, genome: Network, scene: Phaser.Scene, x: number, y: number, texture: string , frame?: string | number )  {
    super(scene, x, y, texture, frame);

    // sprite
    this.setScale(3);
    this.setOrigin(0, 0);

    // variables
    this.isDead = false;
    this.fitness = 0;

    // physics
    this.scene.physics.world.enable(this);   
    this.setSize(17, 12);
    this.setGravityY(1000);

    this.populationIndex = index;
    this.brain = genome;
    this.scene.add.existing(this);
  }

  /**
   * Determines whether the bird should flap its wings or not based on the input and the neural network's output.
   * Fact: the IA response should be similar to (this.y > bottomPipe.y - 90)
   * @param topPipe The top pipe of the gap the bird is trying to pass through.
   * @param bottomPipe The bottom pipe of the gap the bird is trying to pass through.
   * @returns A boolean indicating whether the bird should flap its wings or not.
   */
  shouldIFlap(topPipe:Pipe, bottomPipe:Pipe): boolean{

    
    let base10y = Math.round( Math.abs(this.y) / PIPE_BLOCK_SIZE);
    let base10topPipeY = (Math.round( Math.abs(topPipe.y) / PIPE_BLOCK_SIZE) + 2);
    let base10bottomPipeY = ( Math.round( Math.abs(bottomPipe.y) / PIPE_BLOCK_SIZE));

    let input = [ base10y,
                  base10topPipeY,
                  base10bottomPipeY]
                  
    if (isNaN(base10y)) return false;
    
    let output = this.brain.activate(input, { trace: false });
    // if (this.populationIndex == 0){
    //   console.log('shouldIFlap', input, Math.round(Math.abs(output[0]))==1);          
    // }
    return Math.round(Math.abs(output[0]))==1;
    
  }
  
  /**
   * Updates the bird's fitness, angle, and velocity based on the input and the neural network's output.
   * @param topPipe The top pipe of the gap the bird is trying to pass through.
   * @param bottomPipe The bottom pipe of the gap the bird is trying to pass through.
   */
  update(topPipe:Pipe , bottomPipe:Pipe ): void {
    // Every tick fitness grow:
    if (this.isDead ){
      return;
    }

    //let distanceToMiddleRatio = Math.abs( 1 /  ( 1 + Math.abs(this.y - ( topPipe.y + ((topPipe.y - bottomPipe.y) / 2 )))) )
    this.fitness +=  1;

    // handle angle change
    if (this.angle < 30) {
      this.angle += 2;
    }

    // handle input
    if (this.shouldIFlap(topPipe, bottomPipe)) {
      // flap
      this.setVelocityY(-350);
      this.scene.tweens.add({
        targets: this,
        props: { angle: -20 },
        duration: 150,
        ease: "Power0"
      });
    } 

    // check if off the screen
    if (this.y + this.height > this.scene.sys.canvas.height) {
      this.isDead = true;
    }
  }

  

  /**
   * Gets the fitness of the complete population
   * @returns The fitness of the bird.
   */
  getFitness():number{
    return this.fitness;
  }

  /**
   * Returns an object containing the bird's neural network.
   * @returns An object containing the bird's neural network.
   */
  print(): object{
    let me = 
    {
      brain: this.brain
    }
    return me;
  }

}