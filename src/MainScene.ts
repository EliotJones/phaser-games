import Phaser from "phaser";
import { SoundManager } from "./SoundManager";
import { SCALE } from "./consts";

export class MainScene extends Phaser.Scene {
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
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
        this.load.image('tiles', 'assets/tileset/four-seasons-tileset.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/tileset/terrain.tmj');
        // Animations
        this.load.spritesheet('dude',
            'assets/sprites/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );

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

        // Create Tiled tilemap from JSON file.
        const map = this.make.tilemap({
            key: 'tilemap'
        });

        const tileset = map.addTilesetImage('terrain', 'tiles')!;

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

        this.player = this.physics.add.sprite(10, 500, 'dude').setDisplaySize(16, 48 / 2)
            .setBounce(0.15)
            .setBodySize(26, 40)
            .setOffset(3, 8)
            .setMaxVelocity(100, 250)
            .setDragX(750)
            .setGravityY(102)
            .setCollideWorldBounds(true);

        if (!this.anims.exists('left')) {
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'turn',
                frames: [{ key: 'dude', frame: '4' }],
                frameRate: 20
            });

            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }

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

        const onGround = this.player.body.blocked.down;
        if (!this.cursors || this.isGameOver) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.fKey) && this.powerups.length > 0) {
            this.powerups.pop();
            this.registry.set('powerups', this.powerups);
            this.jumpPowerActive = true;
            this.player.setTint(0xff00ff)
            this.soundManager.playPowerup();
        }

        // Reset jump ability when touching ground
        if (onGround && !this.canJump) {
            this.canJump = true;
        }

        if (this.cursors.left.isDown) {
            if (this.player.body.velocity.x > 0) {
                this.player.setVelocityX(0)
            }
            this.player.setAccelerationX(-this.accel);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            if (this.player.body.velocity.x < 0) {
                this.player.setVelocityX(0)
            }
            this.player.setAccelerationX(this.accel);

            this.player.anims.play('right', true);
        }
        else {
            this.player.setAccelerationX(0);

            this.player.anims.play('turn');
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)
            && this.canJump
            && time > this.lastJumpTime + 200) {
            if (this.jumpPowerActive) {
                this.player.setVelocityY(-400);
                this.player.setGravityY(60);
                this.player.clearTint();
                this.jumpPowerActive = false;
            } else {
                this.player.setVelocityY(-200);
                this.player.setGravityY(102);
            }

            this.lastJumpTime = time;
            this.canJump = false;
        }
    }
}