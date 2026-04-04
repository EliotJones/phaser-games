import Phaser from "phaser";
import { AssetKeys } from "./consts";

export class Loader extends Phaser.Scene {
    constructor() {
        super({ key: 'loader' });
    }

    preload() {
        // Scenery
        // this.load.image(AssetKeys.tilesImage, 'assets/tileset/four-seasons-tileset.png');
        this.load.tilemapTiledJSON(AssetKeys.tilemap, 'assets/tileset/terrain.tmj');
        this.load.spritesheet(AssetKeys.tilesImage, 'assets/tileset/four-seasons-tileset.png',
            {
                frameWidth: 16,
                frameHeight: 16
            }
        );

        // Animations
        this.load.spritesheet(AssetKeys.player,
            'assets/sprites/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );

        // UI
        this.load.image(AssetKeys.scorebar, 'assets/ui/scorebar.png');

        // Sounds
        this.load.audio(AssetKeys.sounds.music, 'assets/music/bg-music.mp3');
        this.load.audio(AssetKeys.sounds.coin, 'assets/music/coin.mp3');
        this.load.audio(AssetKeys.sounds.gameOver, 'assets/music/game-over.mp3');
        this.load.audio(AssetKeys.sounds.itemCollected, 'assets/music/item-collected.mp3');
        this.load.audio(AssetKeys.sounds.powerUpActivated, 'assets/music/power-up.mp3');
    }

    create() {
        this.scene.start('main')
    }
}