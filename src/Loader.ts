import Phaser from "phaser";
import { AssetKeys } from "./consts";

export class Loader extends Phaser.Scene {
    constructor() {
        super({ key: 'loader' });
    }

    preload() {
        // Scenery
        this.load.tilemapTiledJSON(AssetKeys.tilemap, 'assets/tileset/terrain.tmj');
        this.load.spritesheet(AssetKeys.tilesImage, 'assets/tileset/four-seasons-tileset.png',
            {
                frameWidth: 16,
                frameHeight: 16
            }
        );
        this.load.spritesheet(AssetKeys.bomb, 'assets/sprites/mybomb.png', {
            frameWidth: 24,
            frameHeight: 24,
        });

        // Atlas
        this.load.atlas(AssetKeys.atlas, 'assets/atlas/atlas.png', 'assets/atlas/atlas.json');

        // UI
        this.load.image(AssetKeys.scorebar, 'assets/ui/scorebar.png');

        // BG
        this.load.image(AssetKeys.background.bg, 'assets/bg/bg.png');
        this.load.image(AssetKeys.background.close, 'assets/bg/close.png');
        this.load.image(AssetKeys.background.mid, 'assets/bg/mid.png');
        this.load.image(AssetKeys.background.far, 'assets/bg/far.png');

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