import Phaser from "phaser";
import { AssetKeys, config } from "./consts";

export class Loader extends Phaser.Scene {
    constructor() {
        super({ key: 'loader' });
    }

    preload() {
        this.load.path = config.assetPath;

        // Scenery
        this.load.tilemapTiledJSON(AssetKeys.tilemap, 'tileset/terrain.tmj');
        this.load.spritesheet(AssetKeys.tilesImage, 'tileset/four-seasons-tileset.png',
            {
                frameWidth: 16,
                frameHeight: 16
            }
        );
        this.load.spritesheet(AssetKeys.bomb, 'sprites/mybomb.png', {
            frameWidth: 24,
            frameHeight: 24,
        });

        // Atlas
        this.load.atlas(AssetKeys.atlas, 'atlas/atlas.png', 'atlas/atlas.json');

        // UI
        this.load.image(AssetKeys.scorebar, 'ui/scorebar.png');

        // BG
        this.load.image(AssetKeys.background.bg, 'bg/bg.png');
        this.load.image(AssetKeys.background.close, 'bg/close.png');
        this.load.image(AssetKeys.background.mid, 'bg/mid.png');
        this.load.image(AssetKeys.background.far, 'bg/far.png');

        // Sounds
        this.load.audio(AssetKeys.sounds.music, 'music/bg-music.mp3');
        this.load.audio(AssetKeys.sounds.coin, 'music/coin.mp3');
        this.load.audio(AssetKeys.sounds.gameOver, 'music/game-over.mp3');
        this.load.audio(AssetKeys.sounds.itemCollected, 'music/item-collected.mp3');
        this.load.audio(AssetKeys.sounds.powerUpActivated, 'music/power-up.mp3');
    }

    create() {
        this.scene.start('main')
    }
}