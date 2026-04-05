import Phaser from "phaser";
import { SoundManager } from "./SoundManager";
import { AssetKeys, SCALE } from "./consts";
import Player from "./Player";

export class MainScene extends Phaser.Scene {
    player!: Player;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    dangerDeco!: Phaser.Tilemaps.TilemapLayer;
    rippleTime: number = 0;
    canJump = true;
    lastJumpTime: number = 0;
    maxSpeed = 320;
    accel = 500;
    drag = 700;
    goals!: Phaser.Tilemaps.TilemapLayer;
    score = 0;
    soundManager!: SoundManager;
    isGameOver = false;
    jumpPowerActive = false;

    respawnablePowerupTiles = [{ x: 22, y: 34 }];

    bgLayers: Phaser.GameObjects.TileSprite[] = [];

    powerups: string[] = [];
    fKey: Phaser.Input.Keyboard.Key;
    bg: Phaser.GameObjects.Image;

    constructor() {
        super('main');
    }

    preload() {
        // Initialize and preload audio
        this.soundManager = new SoundManager(this);
        this.soundManager.preloadAudio();
    }

    create() {
        this.score = 0;
        this.isGameOver = false;
        this.powerups = [];
        this.jumpPowerActive = false;

        this.registry.set('score', 0);
        this.registry.set('powerups', []);

        this.scene.launch('ui');
        this.scene.bringToTop('ui');

        // Create sound objects and start background music
        this.soundManager.createSounds();
        this.soundManager.playBackgroundMusic();

        this.anims.create({
            key: 'collected',
            frames: this.anims.generateFrameNames(AssetKeys.atlas, { prefix: 'item-feedback/item-feedback-', start: 1, end: 4 }),
            frameRate: 16,
            repeat: 0
        })


        // Create Tiled tilemap from JSON file.
        const map = this.make.tilemap({
            key: 'tilemap'
        });

        // Add background
        const width = this.cameras.main.width * 1;
        const height = this.cameras.main.height * 1;

        this.bg = this.add.image(0, 0, 'bg').setOrigin(0).setScrollFactor(0.1)
            .setDisplaySize(width, height);


        this.bgLayers = [
            this.add.tileSprite(0, 100, width, height, 'far').setOrigin(0).setDepth(0).setScrollFactor(0)
                .setDisplaySize(width, height),
            this.add.tileSprite(0, 100, width, height, 'mid').setOrigin(0).setDepth(0).setScrollFactor(0)
                .setDisplaySize(width, height),
            this.add.tileSprite(0, 100, width, height, 'close').setOrigin(0).setDepth(0).setScrollFactor(0)
                .setDisplaySize(width, height),
        ];

        const tileset = map.addTilesetImage('terrain', AssetKeys.tilesImage)!;

        const terrain = map.createLayer('Terrain', tileset)!;
        map.createLayer('Props', tileset);
        this.goals = map.createLayer('Goals', tileset)!;
        const danger = map.createLayer('Danger', tileset)!;
        this.dangerDeco = map.createLayer('Danger Decor', tileset)!;

        // Mark every non-empty tile as having collision physics for goals, danger and terrain.
        terrain.setCollisionByExclusion([-1]);
        danger.setCollisionByExclusion([-1]);
        this.goals.setCollisionByExclusion([-1]);
        const camera = this.cameras.main;

        this.cursors = this.input.keyboard!.createCursorKeys()!;
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap plus some buffer.
        camera.setBounds(-50, -50, map.widthInPixels + 50, map.heightInPixels + 50);

        this.player = new Player(this, 10, 500);

        const bomb = this.physics.add.sprite(180, 370, AssetKeys.bomb, 0);
        this.anims.create({
            key: 'bombidle',
            frames: this.anims.generateFrameNumbers(AssetKeys.bomb, {
                start: 0,
                end: 5,
            }),
            repeat: -1,
            frameRate: 5
        });
        bomb.setDisplaySize(22, 22)
            .setBodySize(15, 20)
            .setOffset(6, 4);
        bomb.anims.play('bombidle');

        this.physics.add.collider(this.player, terrain);
        this.physics.add.collider(bomb, terrain);

        this.physics.add.collider(this.player, danger, (p, t) => {
            this.gameOver(t as Phaser.Tilemaps.Tile);
        }, undefined, this);

        this.physics.add.overlap(this.player, this.goals, (player, tile) => {
            this.overlapGoalTile(tile as Phaser.Tilemaps.Tile);
        }, undefined, this);

        // Pass round pixels true to stop tile seams.
        camera.startFollow(this.player, true, 0.1, 0.1);
        camera.setZoom(SCALE);

        this.fKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        this.player.on('usePowerup', () => {
            // todo: sparkles and particles
            this.powerups.pop();
            this.registry.set('powerups', this.powerups);
            this.soundManager.playPowerup();
        });

        this.player.on('hitDanger', (tile: Phaser.Tilemaps.Tile) => {
            this.gameOver(tile);
        }, this);
    }

    gameOver(tile: Phaser.Tilemaps.Tile) {
        if (!tile.properties.killer) {
            return;
        }
        this.isGameOver = true;
        this.player.setVelocity(0, 0);
        this.player.setAcceleration(0, 0);
        this.soundManager.playGameOverSound();
        this.scene.restart();
    }

    private playCollectionEffect(x: number, y: number) {
        const fx = this.add.sprite(x, y, AssetKeys.atlas);

        fx.play('collected');

        fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            fx.destroy();
        });
    }

    overlapGoalTile(tile: Phaser.Tilemaps.Tile) {
        if (!!tile.properties.score) {
            this.score += tile.properties.score;
            this.goals.removeTileAt(tile.x, tile.y);
            this.registry.set('score', this.score);
            this.soundManager.playCoinSound();

            this.playCollectionEffect(tile.getCenterX(), tile.getCenterY());

        } else if (tile.properties.powerup === 'jump') {
            this.powerups.push('jump');

            const isRespawnable = this.respawnablePowerupTiles.find(
                coords => coords.x === tile.x && coords.y == tile.y
            )

            this.goals.removeTileAt(tile.x, tile.y);
            if (!!isRespawnable) {
                this.time.delayedCall(5000, () => {
                    this.goals.putTileAt(tile, tile.x, tile.y);
                }, [], this);
            }

            this.soundManager.playItemCollected();
            this.registry.set('powerups', this.powerups);
        } else if (tile.properties.victory) {
            this.playCollectionEffect(tile.getCenterX(), tile.getCenterY());
            this.time.delayedCall(1000, () => {
                this.scene.stop('ui')
                this.scene.start('victory', { score: this.score })
            });
        }
    }

    update(time: number, delta: number): void {

        this.rippleTime += delta;
        this.dangerDeco.x = Math.sin(this.rippleTime * 0.002) * 2;

        const camX = this.cameras.main.scrollX;

        this.bgLayers[0].tilePositionX = camX * 0.1;
        this.bgLayers[1].tilePositionX = camX * 0.2;
        this.bgLayers[2].tilePositionX = camX * 0.3;

        this.player.handleInput({
            activatePowerUp: Phaser.Input.Keyboard.JustDown(this.fKey),
            goLeft: this.cursors.left.isDown,
            goRight: this.cursors.right.isDown,
            jump: Phaser.Input.Keyboard.JustDown(this.cursors.up),
        }, time, this.powerups.length)

        this.player.updateCurrentState();
    }
}