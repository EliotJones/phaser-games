import Phaser from 'phaser';
import { PreloaderScene } from './PreloaderScene';
import { MainScene } from './MainScene';

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'phaser',
    scene: [PreloaderScene, MainScene],
})