export class Pipe extends Phaser.Physics.Arcade.Image {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string , frame?: string | number) {
    super(scene, x, y, texture, frame);

    // image
    this.setScale(3);
    this.setOrigin(0, 0);

    // physics
    this.scene.physics.world.enable(this);
    
    //this.setVelocityY(0);
    
    this.setVelocityX(-200);
    this.setSize(20, 20);
    this.setGravityY(-350);
    

    this.scene.add.existing(this);
    }

}
