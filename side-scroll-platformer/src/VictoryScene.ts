import Phaser from "phaser";

export class VictoryScene extends Phaser.Scene {
    spacebar: Phaser.Input.Keyboard.Key;

    constructor() {
        super('victory')
    }

    create(data: any) {
        this.add.text(this.cameras.default.width / 2, this.cameras.default.height / 2,
            `Victory! You gained ${data.score} points. Press \'space\' to restart.`,
            {
                font: '16px Consolas', color: '#FFF', fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.spacebar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.scene.start('main');
        }
    }
}