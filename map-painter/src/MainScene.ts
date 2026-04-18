import { Scene } from "phaser";
import { WorldMap } from "./Models";
type Grid = Phaser.GameObjects.Grid;
type Rect = Phaser.GameObjects.Rectangle;
type Key = Phaser.Input.Keyboard.Key;
type Group = Phaser.GameObjects.Group;
type TileMap = Phaser.Tilemaps.Tilemap;

export class MainScene extends Scene {
    worldGrid: Grid;
    offsetGrid: Grid;

    highlightSquare: Rect;

    map: WorldMap;
    tileMap: TileMap;

    wgTextGroup: Group;
    ogTextGroup: Group;

    wKey: Key;
    oKey: Key;

    private readonly layerKeys = {
        mud: 'mud',
        grass: 'grass',
    };

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

        this.tileMap = this.make.tilemap({
            width: this.settings.numCells,
            height: this.settings.numCells,
            tileHeight: this.settings.cellSize,
            tileWidth: this.settings.cellSize,
        });

        const mudSet = this.tileMap.addTilesetImage('tiles', 'tiles');
        const tileSet = this.tileMap.addTilesetImage('autotile-grass', 'autotile-grass', 32, 32, 0, 0);
        const mudLayer = this.tileMap.createBlankLayer(this.layerKeys.mud, mudSet!)
            ?.setPosition(this.settings.padding + halfCellSize, this.settings.padding + halfCellSize);;
        this.tileMap.createBlankLayer(this.layerKeys.grass, tileSet!)
            ?.setPosition(this.settings.padding + halfCellSize, this.settings.padding + halfCellSize);
        for (let y = 0; y < this.settings.numCells; y++) {
            for (let x = 0; x < this.settings.numCells; x++) {
                mudLayer?.putTileAt(5, x, y);
            }
        }

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

        this.highlightSquare = this.add.rectangle(
            padding,
            padding,
            cellSize,
            cellSize,
            0xffffff,
            0.5)
            .setOrigin(0)
            .setVisible(false);

        this.wgTextGroup.setVisible(false);
        this.prepKeys();

        this.input.on('pointermove', this.pointerMove.bind(this));
        this.input.on('pointerdown', this.pointerDown.bind(this));
    }

    private cellTopLeft(x: number, y: number, isWorld: boolean) {
        const topLeft = isWorld
            ? [this.settings.padding, this.settings.padding]
            : [this.settings.padding + this.settings.halfCellSize, this.settings.padding + this.settings.halfCellSize];

        const xOffset = (x * this.settings.cellSize) + topLeft[0];
        const yOffset = (y * this.settings.cellSize) + topLeft[1];

        return { x: xOffset, y: yOffset };
    }

    private pointerDown(pointer: Phaser.Input.Pointer) {
        this.requestGrassAt(pointer.x, pointer.y);
    }

    private requestGrassAt(x: number, y: number) {
        const worldCell = this.getWorldCellIndexAt(x, y);
        if (!worldCell) {
            return;
        }

        const mapType = this.map.getType(worldCell.colIx, worldCell.rowIx);
        if (mapType == 'grass') {
            return;
        }

        this.map.setType(worldCell.colIx, worldCell.rowIx, 'grass');

        // Get 4 affected offset grid tile indexes
        const affectedCells = this.getOffsetIndices(worldCell.colIx, worldCell.rowIx);
        for (let i = 0; i < affectedCells.length; i++) {
            const cell = affectedCells[i];
            if (cell.x < 0 || cell.x >= this.settings.numCells
                || cell.y < 0 || cell.y > this.settings.numCells) {
                continue;
            }

            this.tileMap.putTileAt(5, cell.x, cell.y, undefined, this.layerKeys.grass);
        }
    }

    private pointerMove(pointer: Phaser.Input.Pointer) {
        const worldCell = this.getWorldCellIndexAt(pointer.x, pointer.y);
        if (!worldCell) {
            this.highlightSquare.setVisible(false);
        } else {
            const highlightPos = this.cellTopLeft(worldCell.colIx, worldCell.rowIx, true);
            this.highlightSquare.setPosition(highlightPos.x, highlightPos.y);
            this.highlightSquare.setVisible(true);
        }

        if (pointer.isDown) {
            this.requestGrassAt(pointer.x, pointer.y);
        }
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

    private getWorldCellIndexAt(x: number, y: number) {
        const padding = this.settings.padding;
        const cellSize = this.settings.cellSize;

        const leftBound = padding;
        const topBound = padding;
        const rightBound = (this.settings.numCells * cellSize) + padding;
        const bottomBound = rightBound; // square

        if (x < leftBound || x > rightBound
            || y < topBound
            || y > bottomBound) {
            return null;
        }

        const colIx = Math.floor((x - padding) / cellSize);
        const rowIx = Math.floor((y - padding) / cellSize);
        return { colIx, rowIx };
    }

    private getOffsetIndices(colIx: number, rowIx: number) {
        return [
            { x: colIx - 1, y: rowIx - 1 },
            { x: colIx, y: rowIx - 1 },
            { x: colIx - 1, y: rowIx },
            { x: colIx, y: rowIx },
        ]
    }
}