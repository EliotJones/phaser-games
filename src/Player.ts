import Phaser from "phaser";
import { AssetKeys } from "./consts";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, AssetKeys.player);

        scene.add.existing(this);
        scene.physics.add.existing(this).setDisplaySize(16, 48 / 2)
            .setBounce(0.15)
            .setBodySize(26, 40)
            .setOffset(3, 8)
            .setMaxVelocity(100, 250)
            .setDragX(750)
            .setGravityY(102)
            .setCollideWorldBounds(true);

        this.createAnims(scene);
    }

    public isOnGround(): boolean {
        return this.body?.blocked.down ?? false;
    }

    private createAnims(scene: Phaser.Scene) {
        if (!scene.anims.exists('left')) {
            scene.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers(AssetKeys.player, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
            scene.anims.create({
                key: 'turn',
                frames: [{ key: AssetKeys.player, frame: 4 }],
                frameRate: 20
            });
            scene.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers(AssetKeys.player, { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }
}