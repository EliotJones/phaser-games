import { Scene } from "phaser";
import { Corners, cornersToByte, RotatedTile, Types, WorldMap } from "./Models";
type Grid = Phaser.GameObjects.Grid;
type Rect = Phaser.GameObjects.Rectangle;
type Key = Phaser.Input.Keyboard.Key;
type Group = Phaser.GameObjects.Group;
type TileMap = Phaser.Tilemaps.Tilemap;

export class MainScene extends Scene {
    worldGrid: Grid;
    offsetGrid: Grid;

    highlightSquare: Rect;
    typeCornersToTextureIndexLookup: Map<Types, Map<number, number[]>>;

    map: WorldMap;
    tileMap: TileMap;

    wgTextGroup: Group;
    ogTextGroup: Group;

    oKey: Key;
    sKey: Key;
    wKey: Key;

    private readonly priority: Types[] = ['mud', 'sand', 'grass'];

    private readonly layerKeys = {
        mud: 'mud',
        grass: 'grass',
        sand: 'sand',
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

    createLookupForRotatedTiles(rotatedTiles: RotatedTile[]): Map<number, number[]> {
        const m: Map<number, number[]> = new Map();
        for (let i = 0; i < rotatedTiles.length; i++) {
            const element = rotatedTiles[i];
            const current = m.get(element.corners);
            if (!current) {
                m.set(element.corners, [element.tileIndex]);
            } else {
                current.push(element.tileIndex);
            }
        }

        return m;
    }

    create(data: any) {
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
        const grassTileSet = this.tileMap.addTilesetImage('autotile-grass', 'autotile-grass', 32, 32, 0, 0);
        const sandTileSet = this.tileMap.addTilesetImage('autotile-sand', 'autotile-sand', 32, 32, 0, 0);
        const grassTiles = data.grassTiles as RotatedTile[];
        const sandTiles = data.sandTiles as RotatedTile[];
        this.typeCornersToTextureIndexLookup = new Map();
        const grass = this.createLookupForRotatedTiles(grassTiles);
        const sand = this.createLookupForRotatedTiles(sandTiles);
        this.typeCornersToTextureIndexLookup.set('grass', grass);
        this.typeCornersToTextureIndexLookup.set('sand', sand);

        const mudLayer = this.tileMap.createBlankLayer(this.layerKeys.mud, mudSet!)
            ?.setPosition(this.settings.padding + halfCellSize, this.settings.padding + halfCellSize);
        const sandLayer = this.tileMap.createBlankLayer(this.layerKeys.sand, sandTileSet!)
            ?.setPosition(this.settings.padding + halfCellSize, this.settings.padding + halfCellSize);
        this.tileMap.createBlankLayer(this.layerKeys.grass, grassTileSet!)
            ?.setPosition(this.settings.padding + halfCellSize, this.settings.padding + halfCellSize);
        for (let y = 0; y < this.settings.numCells; y++) {
            for (let x = 0; x < this.settings.numCells; x++) {
                mudLayer?.putTileAt(8, x, y);
            }
        }

        this.map = new WorldMap(this.settings.numCells + 1,
            this.settings.numCells + 1);

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
            this.settings.offsetGridOpacity)
            .setOrigin(0, 0)
            .setVisible(false);

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
        this.ogTextGroup.setVisible(false);
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
        const reqType = this.sKey.isDown ? 'sand' : 'grass';
        this.requestLayerAt(pointer.x, pointer.y, reqType);
    }

    private requestLayerAt(x: number, y: number, type: Types) {
        const worldCell = this.getWorldCellIndexAt(x, y);
        if (!worldCell) {
            return;
        }

        const mapType = this.map.getType(worldCell.colIx, worldCell.rowIx);
        if (mapType == type) {
            return;
        }

        this.map.setType(worldCell.colIx, worldCell.rowIx, type);

        // Get 4 affected offset grid tile indexes
        const touchedOffsetCells = this.getOffsetIndices(worldCell.colIx, worldCell.rowIx);

        const tileLookup = this.typeCornersToTextureIndexLookup.get(type);
        if (!tileLookup) {
            return;
        }

        const priority = this.priority.indexOf(type);

        for (let i = 0; i < touchedOffsetCells.length; i++) {
            const offsetCell = touchedOffsetCells[i];
            if (!this.validOffsetIndex(offsetCell.x, offsetCell.y)) {
                continue;
            }

            const offsetCellCorners: Corners = [0, 0, 0, 0]
            const worldCellNeighbors = this.getWorldIndices(offsetCell.x, offsetCell.y);

            for (let wI = 0; wI < worldCellNeighbors.length; wI++) {
                const worldCellIx = worldCellNeighbors[wI];
                if (worldCellIx.x < 0 || worldCellIx.y < 0) {
                    offsetCellCorners[wI] = 1;
                }

                // Remove other layer tiles above the currently drawn tile.
                // on borders where there are higher priority neighbors treat
                // those as occupied by the same type, so if we're at a boundary
                // from sand to grass we should draw a full sand tile so that there's
                // no mud visible between the 2 boundaries.
                const typeAt = this.map.getType(worldCellIx.x, worldCellIx.y);
                if (typeAt == type) {
                    offsetCellCorners[wI] = 1;
                } else {
                    const otherPriority = this.priority.indexOf(typeAt)

                    if (otherPriority > priority) {
                        offsetCellCorners[wI] = 1;
                    }
                }
            }

            const myCornersByte = cornersToByte(offsetCellCorners);
            const textureIndex = tileLookup.get(myCornersByte);

            if (textureIndex == null || textureIndex.length === 0) {
                continue;
            }

            var rnd = Phaser.Math.RND;

            const myTile = rnd.between(0, textureIndex.length - 1);
            this.tileMap.putTileAt(textureIndex[myTile],
                offsetCell.x,
                offsetCell.y,
                undefined,
                type == 'grass' ? this.layerKeys.grass : this.layerKeys.sand);
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
            const reqType = this.sKey.isDown ? 'sand' : 'grass';
            this.requestLayerAt(pointer.x, pointer.y, reqType);
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
        this.oKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        this.sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    }

    private getWorldCellIndexAt(x: number, y: number) {
        const padding = this.settings.padding;
        const cellSize = this.settings.cellSize;

        const leftBound = padding;
        const topBound = padding;
        const rightBound = (this.settings.numCells * cellSize) + padding + (cellSize / 2);
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

    private getWorldIndices(colIx: number, rowIx: number) {
        return [
            { x: colIx, y: rowIx },
            { x: colIx + 1, y: rowIx },
            { x: colIx, y: rowIx + 1 },
            { x: colIx + 1, y: rowIx + 1 },
        ];
    }

    private validOffsetIndex(colIx: number, rowIx: number) {
        return colIx >= 0 && colIx < this.settings.numCells
            && rowIx >= 0 && rowIx < this.settings.numCells;
    }
}