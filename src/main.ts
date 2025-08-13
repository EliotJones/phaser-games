import { NATIVE_HEIGHT, NATIVE_WIDTH, SCALE } from "./consts";
import { MainScene } from "./MainScene";
import { UIScene } from "./UIScene";

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: NATIVE_WIDTH,
    height: NATIVE_HEIGHT,
    parent: 'phaser',
    scene: [MainScene, UIScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                x: 0,
                y: 200
            },
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: NATIVE_WIDTH * SCALE,  // actual canvas size to avoid subpixel tile seams
        height: NATIVE_HEIGHT * SCALE
    },
    render: {
        pixelArt: true,
    }
})