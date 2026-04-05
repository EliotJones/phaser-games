import Phaser from "phaser";
import { AssetKeys } from "./consts";

export class UIScene extends Phaser.Scene {
    barContainer: Phaser.GameObjects.Container;
    scoreText: Phaser.GameObjects.Text;
    pupsText: Phaser.GameObjects.Text;

    shownPowerupHint = false;
    powerupHintText: Phaser.GameObjects.Text;

    constructor() {
        super('ui');
    }

    preload() {
    }

    create() {
        this.barContainer = this.add.container(0, 0);
        const img = this.add.image(5, 5, AssetKeys.scorebar).setOrigin(0, 0)
            .setScale(1, 0.8);
        this.barContainer.add(img);


        const fruit = this.add.image(5 + 12, 5 + 4, AssetKeys.tilesImage, 127)
            .setOrigin(0, 0);

        this.barContainer.add(fruit);

        const scoreTextX = 5 + 12 + fruit.displayWidth;
        const scoreTextY = 5 + 5;
        this.scoreText = this.add.text(scoreTextX, scoreTextY, `0`,
            {
                font: '16px Consolas', color: '#FFF',
            });

        this.barContainer.add(this.scoreText);

        const potion = this.add.image(5 + 12 + 45, 5 + 4, AssetKeys.tilesImage, 94)
            .setOrigin(0, 0)

        this.barContainer.add(potion);

        const pupsTextX = potion.x + potion.displayWidth;
        const pupsTextY = potion.y + 1;
        this.pupsText = this.add.text(pupsTextX, pupsTextY, `0`,
            {
                font: '16px Consolas', color: '#FFF',
            });

        this.powerupHintText = this.add.text(this.cameras.default.width / 2, this.cameras.default.height / 2,
            'Press "F" to use the potion to jump higher',
            {
                font: '12px Consolas', color: '#FFF'
            }
        ).setOrigin(0.5)
            .setVisible(false);

        this.registry.events.on('changedata-score', this.updateScore, this);

        this.registry.events.on('changedata-powerups', this.updatePowerups, this);
    }

    updateScore(parent: any, score: number) {
        this.scoreText.setText(`${score}`);
    }
    updatePowerups(parent: any, powerups: string[]) {
        if (powerups.length > 0 && !this.shownPowerupHint) {
            this.shownPowerupHint = true;
            this.powerupHintText.setVisible(true).setAlpha(1);

            this.tweens.add({
                targets: this.powerupHintText,
                alpha: 0,
                duration: 3000, // Show for 3 seconds
                delay: 2000,    // Wait 2 seconds before fading
                onComplete: () => {
                    this.powerupHintText.setVisible(false);
                }
            });
        }

        this.pupsText.setText(`${powerups.length}`);
    }

    shutdown() {
        this.registry.events.off('changedata-score', this.updateScore);
        this.registry.events.off('changedata-powerups', this.updatePowerups);
    }

    destroy() {
        this.registry.events.off('changedata-score', this.updateScore);
        this.registry.events.off('changedata-powerups', this.updatePowerups);
    }

    init() {
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
        this.events.on(Phaser.Scenes.Events.DESTROY, this.destroy, this);
    }
}
