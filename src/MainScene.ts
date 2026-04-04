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

    powerups: string[] = [];
    fKey: Phaser.Input.Keyboard.Key;

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

        this.physics.add.collider(this.player, terrain);

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

    overlapGoalTile(tile: Phaser.Tilemaps.Tile) {
        if (!!tile.properties.score) {
            this.score += tile.properties.score;
            this.goals.removeTileAt(tile.x, tile.y);
            this.registry.set('score', this.score);
            this.soundManager.playCoinSound();

            const fx = this.add.sprite(tile.getCenterX(), tile.getCenterY(), AssetKeys.atlas);

            fx.play('collected');

            fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                fx.destroy();
            });

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
        }
    }

    update(time: number, delta: number): void {

        this.rippleTime += delta;
        this.dangerDeco.x = Math.sin(this.rippleTime * 0.002) * 2;

        this.player.handleInput({
            activatePowerUp: Phaser.Input.Keyboard.JustDown(this.fKey),
            goLeft: this.cursors.left.isDown,
            goRight: this.cursors.right.isDown,
            jump: Phaser.Input.Keyboard.JustDown(this.cursors.up),
        }, time, this.powerups.length)

        this.player.updateCurrentState();
    }
}