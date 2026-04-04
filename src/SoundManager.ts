import Phaser from "phaser";

export class SoundManager {
    private scene: Phaser.Scene;
    private sounds: Map<string, Phaser.Sound.BaseSound>;
    private musicVolume: number = 0.7;
    private sfxVolume: number = 0.8;
    private isMuted = false;
    private isCreated = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.sounds = new Map();
    }

    preloadAudio(): void {
    }

    createSounds(): void {
        if (this.isCreated) {
            return;
        }

        // Create and store sound objects
        this.sounds.set('bg-music', this.scene.sound.add('bg-music', {
            volume: this.musicVolume,
            loop: true
        }));

        this.sounds.set('coin', this.scene.sound.add('coin', {
            volume: this.sfxVolume
        }));

        this.sounds.set('game-over', this.scene.sound.add('game-over', {
            volume: this.sfxVolume
        }));

        this.sounds.set('item-collected', this.scene.sound.add('item-collected', {
            volume: this.sfxVolume
        }));

        this.sounds.set('power-up', this.scene.sound.add('power-up', {
            volume: this.sfxVolume
        }));

        this.isCreated = true;
    }

    playSound(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
        if (this.isMuted) return;

        const sound = this.sounds.get(key);
        if (!!sound && !sound.isPlaying) {
            sound.play(config);
        }
    }

    stopSound(key: string): void {
        const sound = this.sounds.get(key);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    pauseSound(key: string): void {
        const sound = this.sounds.get(key);
        if (sound && sound.isPlaying) {
            sound.pause();
        }
    }

    resumeSound(key: string): void {
        const sound = this.sounds.get(key);
        if (sound && sound.isPaused) {
            sound.resume();
        }
    }

    fadeOut(key: string, duration: number = 1000): void {
        const sound = this.sounds.get(key);
        if (sound && sound.isPlaying) {
            this.scene.tweens.add({
                targets: sound,
                volume: 0,
                duration: duration,
                onComplete: () => {
                    sound.stop();
                }
            });
        }
    }

    fadeIn(key: string, targetVolume?: number, duration: number = 1000): void {
        const sound = this.sounds.get(key);
        if (sound) {
            const volume = targetVolume || (key === 'bg-music' ? this.musicVolume : this.sfxVolume);
            sound.setVolume(0);
            sound.play();

            this.scene.tweens.add({
                targets: sound,
                volume: volume,
                duration: duration
            });
        }
    }

    crossFade(fromKey: string, toKey: string, duration: number = 1000): void {
        // Fade out current sound
        this.fadeOut(fromKey, duration);

        // Fade in new sound after a short delay
        this.scene.time.delayedCall(duration * 0.1, () => {
            this.fadeIn(toKey, undefined, duration * 0.9);
        });
    }

    setMusicVolume(volume: number): void {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        const bgMusic = this.sounds.get('bg-music');
        if (bgMusic) {
            bgMusic.setVolume(this.musicVolume);
        }
    }

    setSFXVolume(volume: number): void {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        // Update all non-music sounds
        this.sounds.forEach((sound, key) => {
            if (key !== 'bg-music') {
                sound.setVolume(this.sfxVolume);
            }
        });
    }

    toggleMute(): void {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.scene.sound.pauseAll();
        } else {
            this.scene.sound.resumeAll();
        }
    }

    stopAll(): void {
        this.sounds.forEach(sound => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
    }

    destroy(): void {
        this.stopAll();
        this.sounds.clear();
    }

    // Convenience methods for common game events
    playBackgroundMusic(): void {
        this.fadeIn('bg-music');
    }

    playCoinSound(): void {
        this.playSound('coin', {
            detune: Phaser.Math.RND.between(0, 99)
        });
    }

    playGameOverSound(): void {
        this.playSound('game-over');
    }

    playItemCollected(): void {
        this.playSound('item-collected')
    }

    playPowerup(): void {
        this.playSound('power-up')
    }
}