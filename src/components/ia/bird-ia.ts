import { Pipe } from "../common/pipe";

export class BirdIA extends Phaser.Physics.Arcade.Sprite {
  private isDead: boolean;
  // private isFlapping: number;
  private weightTop!: number;
  private weightBottom!: number;
  private weightY!: number;
  private fitness!:number;
  private BIAS:number = 600;

  public getDead(): boolean {
    return this.isDead;
  }

  public setDead(dead: boolean): void {
    this.isDead = dead;
    this.setVisible(false);
    this.setActive(false);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string , frame?: string | number, weightTop?:number, weightBottom?:number , weightY?:number )  {
    super(scene, x, y, texture, frame);

    // sprite
    this.setScale(3);
    this.setOrigin(0, 0);

    // variables
    this.isDead = false;
    //this.isFlapping = 0;
    this.fitness = 0;

    // physics
    this.scene.physics.world.enable(this);   
    this.setSize(17, 12);
    this.setGravityY(1000);

    
    // this.weightY = -7;
    // this.weightTop = -2.3
    // this.weightBottom = -5
    if (weightTop == null || weightTop == -1){
      this.weightTop = Math.random()* - 120;
    }
    else {  
      this.weightTop = Math.random()*30 - weightTop;
    }

    if (weightBottom == null || weightBottom == -1){
      this.weightBottom = Math.random()*30;
    }
    else {  
      this.weightBottom = Math.random()*5 + weightBottom;
    }
    if (weightY == null || weightY == -1){
      this.weightY = Math.random()* - 30;
    }
    else {  
      this.weightY = Math.random()*5 - weightY;
    }


    this.scene.add.existing(this);
  }


  shouldIFlap(topPipe:Pipe, bottomPipe:Pipe): boolean{
    
    
    let addition = (this.y * this.weightY) + ((topPipe.y-this.y) * this.weightTop) + ((bottomPipe.y-this.y) * this.weightBottom) + this.BIAS;
    let formula =  Math.tanh(addition) ; 
    
    //console.info(formula, addition, this.y, this.weightY, this.weightTop, this.weightBottom, this.BIAS );

    if (formula < 0.5 ){
      return true;
    }
    return false;
    
    // let value = false;
    // //let passBotton = (this.y > (bottomPipe + 90 ));
    // let passTop =  (this.y < (topPipe.y + 30 + this.weightTop))
    // let passBotton =  (this.y < (bottomPipe.y - 30 - this.weightBottom ))
    // if (!passTop || !passBotton) {
    //   value = true;
    // }
    // return value;
  }
  
  
  update(topPipe:Pipe , bottomPipe:Pipe ): void {
    // Every tick fitness grow:
    if (this.isDead ){
      return;
    }

    this.fitness += 1;

    // handle angle change
    if (this.angle < 30) {
      this.angle += 2;
    }

    // handle input
    if (this.shouldIFlap(topPipe, bottomPipe)) {
      // flap
      //this.isFlapping = 1;
      this.setVelocityY(-350);
      this.scene.tweens.add({
        targets: this,
        props: { angle: -20 },
        duration: 150,
        ease: "Power0"
      });
    } 
    //else if (this.isFlapping > 0) {
    //  this.isFlapping -=1;
    //}

    // check if off the screen
    if (this.y + this.height > this.scene.sys.canvas.height) {
      this.isDead = true;
    }
  }

  public getFitness():number{
    return this.fitness;
  }

  print(): object{
    let me = 
    {
      fitness: this.fitness, 
      wy: this.weightY,
      wt: this.weightTop,
      wb: this.weightBottom,
      bias: this.BIAS
    }
    return me;
  }

}