export class BirdIA extends Phaser.Physics.Arcade.Sprite {
  private isDead: boolean;
  private isFlapping: number;

  public getDead(): boolean {
    return this.isDead;
  }

  public setDead(dead: boolean): void {
    this.isDead = dead;
    this.setVisible(false);
    this.setActive(false);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string , frame?: string | number) {
    super(scene, x, y, texture, frame);

    // sprite
    this.setScale(3);
    this.setOrigin(0, 0);

    // variables
    this.isDead = false;
    this.isFlapping = 0;

    // physics
    this.scene.physics.world.enable(this);   
    this.setSize(17, 12);
    this.setGravityY(1000);

    // Imput for IA must by logical
    // input 
    // if (this.scene!= null && this.scene.input !=null && this.scene.input.keyboard !=null){
    //     this.jumpKey = this.scene.input.keyboard.addKey(
    //     Phaser.Input.Keyboard.KeyCodes.SPACE
    //     );
    // }

    this.scene.add.existing(this);
  }


  shouldIFlap(topPipe:number, bottomPipe:number): boolean{
    
    let value = false;
    //let random:number = Math.random()*100;
    //let passBotton = (this.y > (bottomPipe + 90 ));
    let passTop =  (this.y < (topPipe + 170 ))
    
    if (!passTop) {
      value = true;
    }

    // if (value){
    //    value = (random > 50);
    // }

    //console.info("shouldIFlap",  topPipe, bottomPipe, this.y, passBotton, passTop , value );

    return value;
  }
  
  
  update(topPipe:number, bottomPipe: number): void {
    // handle angle change
    if (this.angle < 30) {
      this.angle += 2;
    }

    // handle input
    if (this.shouldIFlap(topPipe, bottomPipe) && this.isFlapping < 1) {
      // flap
      this.isFlapping = 1;
      this.setVelocityY(-350);
      this.scene.tweens.add({
        targets: this,
        props: { angle: -20 },
        duration: 150,
        ease: "Power0"
      });
    } 
    else if (this.isFlapping > 0) {
      this.isFlapping -=1;
    }

    // check if off the screen
    if (this.y + this.height > this.scene.sys.canvas.height) {
      this.isDead = true;
    }
  }
}

