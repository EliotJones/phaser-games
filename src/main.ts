import { MainScene } from "./MainScene";
import { UIScene } from "./UIScene";

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 700,
    height: 500,
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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: true,
    }
})