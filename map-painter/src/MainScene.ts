import { Scene } from "phaser";
import { WorldMap } from "./Models";
type Grid = Phaser.GameObjects.Grid;
type Key = Phaser.Input.Keyboard.Key;
type Group = Phaser.GameObjects.Group;

export class MainScene extends Scene {
    worldGrid: Grid;
    offsetGrid: Grid;

    map: WorldMap;

    wgTextGroup: Group;
    ogTextGroup: Group;

    wKey: Key;
    oKey: Key;

    private readonly settings = {
        cellSize: 32,
        numCells: 20,
        gridDim: 32 * 20,
        padding: 64,
        halfCellSize: 32 / 2,
        worldGridColor: 0xff00f3,
        worldGridOpacity: 0.5,
        offsetGridColor: 0x00efae,
        offsetGridOpacity: 0.3,
    };

    constructor() {
        super({ key: 'main' });
    }

    preload() {
    }

    create() {
        const padding = this.settings.padding;
        const gridDim = this.settings.gridDim;
        const cellSize = this.settings.cellSize;
        const halfCellSize = this.settings.halfCellSize;

        const tileMap = this.make.tilemap({
            width: this.settings.numCells,
            height: this.settings.numCells,
            tileHeight: this.settings.cellSize,
            tileWidth: this.settings.cellSize,
        });

        const mudSet = tileMap.addTilesetImage('tiles', 'tiles');
        const tileSet = tileMap.addTilesetImage('autotile-grass', 'autotile-grass', 32, 32, 0, 0);
        const mudLayer = tileMap.createBlankLayer('mud', mudSet!)
            ?.setPosition(this.settings.padding + halfCellSize, this.settings.padding + halfCellSize);;
        const layer = tileMap.createBlankLayer('layer', tileSet!)
            ?.setPosition(this.settings.padding + halfCellSize, this.settings.padding + halfCellSize);
        for (let y = 0; y < this.settings.numCells; y++) {
            for (let x = 0; x < this.settings.numCells; x++) {
                mudLayer?.putTileAt(5, x, y);
                layer!.putTileAt(0, x, y);
            }
        }

        layer?.putTileAt(1, 10, 10);
        layer?.putTileAt(2, 11, 10);
        layer?.putTileAt(3, 12, 10);
        layer?.putTileAt(4, 13, 10);
        layer?.putTileAt(5, 14, 10);
        layer?.putTileAt(6, 15, 10);
        layer?.putTileAt(7, 16, 10);
        layer?.putTileAt(8, 17, 10);
        layer?.putTileAt(9, 18, 10);
        layer?.putTileAt(10, 19, 10);

        layer?.putTileAt(11, 0, 11);
        layer?.putTileAt(12, 1, 11);
        layer?.putTileAt(13, 2, 11);
        layer?.putTileAt(14, 3, 11);

        layer?.putTileAt(13, 17, 19);
        layer?.putTileAt(13, 18, 19);
        layer?.putTileAt(4, 19, 19);
        layer?.putTileAt(12, 19, 18);
        layer?.putTileAt(12, 19, 17);
        layer?.putTileAt(3, 19, 16);

        layer?.putTileAt(10, 18, 16);
        layer?.putTileAt(12, 18, 15);

        layer?.removeTileAt(19, 15);

        this.map = new WorldMap(this.settings.numCells,
            this.settings.numCells);

        this.worldGrid = this.add.grid(padding, padding,
            gridDim + cellSize, gridDim + cellSize,
            cellSize, cellSize,
            undefined, undefined,
            this.settings.worldGridColor,
            this.settings.worldGridOpacity)
            .setOrigin(0, 0)
            .setVisible(false);

        this.offsetGrid = this.add.grid(padding + halfCellSize, padding + halfCellSize,
            gridDim, gridDim,
            cellSize, cellSize,
            undefined, undefined,
            this.settings.offsetGridColor,
            this.settings.offsetGridOpacity).setOrigin(0, 0);

        this.wgTextGroup = this.add.group();
        this.ogTextGroup = this.add.group();

        for (let rowIx = 0; rowIx < this.settings.numCells; rowIx++) {
            for (let colIx = 0; colIx < this.settings.numCells; colIx++) {
                const tlw = this.cellTopLeft(colIx, rowIx, true);
                const tlo = this.cellTopLeft(colIx, rowIx, false);
                const ixText = `${colIx},${rowIx}`;

                this.wgTextGroup.add(this.add.text(tlw.x + 2, tlw.y + 2, ixText, {
                    font: '10px Consolas',
                    color: "#ff00f3"
                }));

                this.ogTextGroup.add(this.add.text(tlo.x + 2, tlo.y + 2, ixText, {
                    font: '10px Consolas',
                    color: '#00efae'
                }));
            }
        }

        this.wgTextGroup.setVisible(false);
        this.prepKeys();
    }

    private cellTopLeft(x: number, y: number, isWorld: boolean) {
        const topLeft = isWorld
            ? [this.settings.padding, this.settings.padding]
            : [this.settings.padding + this.settings.halfCellSize, this.settings.padding + this.settings.halfCellSize];

        const xOffset = (x * this.settings.cellSize) + topLeft[0];
        const yOffset = (y * this.settings.cellSize) + topLeft[1];

        return { x: xOffset, y: yOffset };
    }

    update(time: number, delta: number): void {
        if (this.toggleWorldGrid()) {
            const newVal = !this.worldGrid.visible;
            this.worldGrid.setVisible(newVal);
            this.wgTextGroup.setVisible(newVal);
        }

        if (this.toggleOffsetGrid()) {
            const newVal = !this.offsetGrid.visible;
            this.offsetGrid.setVisible(newVal);
            this.ogTextGroup.setVisible(newVal);
        }
    }

    private toggleWorldGrid() {
        return Phaser.Input.Keyboard.JustDown(this.wKey);
    }

    private toggleOffsetGrid() {
        return Phaser.Input.Keyboard.JustDown(this.oKey);
    }

    private prepKeys() {
        this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.oKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    }
}