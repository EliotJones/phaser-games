import Phaser from "phaser";
import { AssetKeys, GameInputState } from "./consts";

type PlayerState = 'idle' | 'jumping' | 'falling' | 'running';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private lastJumpTime = 0;
    private jumpPowerActive = false;
    private lastOnGroundTime = 0;

    private readonly JUMP_COOLDOWN = 200; // ms
    private readonly NORMAL_JUMP_FORCE = -200;
    private readonly POWER_JUMP_FORCE = -400;
    private readonly NORMAL_GRAVITY = 102;
    private readonly POWER_GRAVITY = 60;
    private readonly ACCEL = 500;
    private readonly COYOTE_TIME = 500;

    private readonly animKeys = {
        idle: 'idle',
        run: 'run',
        jump: 'jump',
        fall: 'fall',
        hurt: 'hurt'
    }

    private currentState: PlayerState = 'idle';
    private facing = 1;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, AssetKeys.atlas, 'player/idle/player-idle-1');

        scene.add.existing(this);
        scene.physics.add.existing(this).setDisplaySize(28, 28)
            .setBounce(0.15)
            .setBodySize(18, 22)
            .setOffset(6, 9)
            .setMaxVelocity(100, 250)
            .setDragX(750)
            .setGravityY(102)
            .setCollideWorldBounds(true);

        this.createAnims(scene);
        this.anims.play(this.animKeys.idle);
    }

    public handleInput(input: GameInputState, time: number, powerupsAvailable: number) {
        if (input.activatePowerUp && powerupsAvailable > 0) {
            this.activatePowerJump();
        }

        if (this.body?.blocked.down) {
            this.lastOnGroundTime = time;
        }

        this.handleHorizontalMovement(input);

        const canJumpNow =
            time < this.lastOnGroundTime + this.COYOTE_TIME &&
            time > this.lastJumpTime + this.JUMP_COOLDOWN;

        if (input.jump && canJumpNow) {
            this.performJump(time);
        }
    }

    public updateCurrentState() {
        const onGround = this.body!.blocked.down;
        const vx = this.body!.velocity.x;
        const vy = this.body!.velocity.y;

        // Facing
        if (vx > 0) {
            this.facing = 1;
        }
        else if (vx < 0) {
            this.facing = -1;
        }

        this.setFlipX(this.facing === -1);

        // State machine
        if (onGround) {
            if (Math.abs(vx) > 10) {
                this.setCurrentState('running');
            } else {
                this.setCurrentState('idle');
            }
        } else {
            if (vy < -5) {
                this.setCurrentState('jumping');
            } else if (vy > 5) {
                this.setCurrentState('falling');
            }
        }
    }

    private setCurrentState(newState: PlayerState) {
        if (this.currentState === newState) {
            return;
        }

        this.currentState = newState;

        let animKey = this.animKeys.idle;
        switch (newState) {
            case "falling":
                animKey = this.animKeys.fall;
                break;
            case "jumping":
                animKey = this.animKeys.jump;
                break;
            case "running":
                animKey = this.animKeys.run;
                break;
        }

        this.anims.play(animKey, true);
    }

    private activatePowerJump() {
        this.scene.events.emit('usePowerup');
        this.jumpPowerActive = true;
        this.setTint(0xff22ff);
        // sparkles and particles
    }

    private handleHorizontalMovement(input: GameInputState) {
        if (input.goLeft) {
            if (this.body!.velocity.x > 0) {
                this.setVelocityX(0)
            }

            this.setAccelerationX(-this.ACCEL);
        }
        else if (input.goRight) {
            if (this.body!.velocity.x < 0) {
                this.setVelocityX(0)
            }
            this.setAccelerationX(this.ACCEL);
        }
        else {
            this.setAccelerationX(0);
        }
    }

    private performJump(time: number): void {
        if (this.jumpPowerActive) {
            this.setVelocityY(this.POWER_JUMP_FORCE);
            this.setGravityY(this.POWER_GRAVITY);
            this.clearTint();
            this.jumpPowerActive = false;
        } else {
            this.setVelocityY(this.NORMAL_JUMP_FORCE);
            this.setGravityY(this.NORMAL_GRAVITY);
        }

        this.lastJumpTime = time;
    }

    private createAnims(scene: Phaser.Scene) {
        var animVel = 15;
        scene.anims.create(
            {
                key: this.animKeys.idle,
                frames: scene.anims.generateFrameNames(AssetKeys.atlas,
                    {
                        prefix: 'player/idle/player-idle-',
                        start: 1,
                        end: 4,
                    }),
                repeat: -1,
                frameRate: animVel - 6
            });
        scene.anims.create({
            key: this.animKeys.run,
            frames: scene.anims.generateFrameNames(AssetKeys.atlas, {
                prefix: 'player/run/player-run-',
                start: 1,
                end: 6,
            }),
            frameRate: animVel - 3,
            repeat: -1
        });
        scene.anims.create({
            key: this.animKeys.jump,
            frames: scene.anims.generateFrameNames(AssetKeys.atlas, { prefix: 'player/jump/player-jump-', start: 1, end: 1 }),
            frameRate: 1,
            repeat: 0
        });
        scene.anims.create({
            key: this.animKeys.fall,
            frames: scene.anims.generateFrameNames(AssetKeys.atlas, { prefix: 'player/jump/player-jump-', start: 2, end: 2 }),
            frameRate: 1,
            repeat: 0
        });
        scene.anims.create({
            key: this.animKeys.hurt,
            frames: scene.anims.generateFrameNames(AssetKeys.atlas, {
                prefix: 'player/hurt/player-hurt-',
                start: 1,
                end: 2,
            }),
            frameRate: animVel - 3,
            repeat: -1
        });
    }
}