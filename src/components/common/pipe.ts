export class Pipe extends Phaser.Physics.Arcade.Image {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string , frame?: string | number) {
    super(scene, x, y, texture, frame);

    // escale de imagen es 3, como son 20 pixeles de ancho y 20 de alto asi que equivalen a 60 pixeles
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
