import { Scene } from "phaser";
import { config } from "./config";
import { Corners, cornersToByte, RotatedTile } from "./Models";

export class PreloaderScene extends Scene {
    readonly grassCorners: Corners[] = [
        [1, 1, 1, 1],
        [0, 1, 0, 0],
        [1, 1, 1, 1],
        [0, 1, 1, 1],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 1],
        [0, 1, 1, 1],
    ];

    readonly sandCorners: Corners[] = [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [0, 1, 1, 0],
        [1, 0, 1, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 1, 1],
        [0, 1, 1, 1],
        [0, 1, 0, 0],
    ];

    constructor() {
        super({ key: 'preloader' });
    }

    preload() {
        this.load.path = config.assetPath;

        // Scenery
        this.load.spritesheet('tiles', 'tiles/five-grid.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('sand-tiles', 'tiles/sand-tiles.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    private createTilesetCanvas(tiles: RotatedTile[], prefix: string) {
        const tileSize = 32;
        const canvas = document.createElement('canvas');
        canvas.width = tileSize * tiles.length;
        canvas.height = tileSize;
        const ctx = canvas.getContext('2d')!;

        tiles.forEach((tile, i) => {
            const frameImg = this.textures.get(tile.textureKey).getSourceImage() as HTMLCanvasElement;
            ctx.drawImage(frameImg, i * tileSize, 0);
        });

        // Add as Phaser texture
        this.textures.addCanvas(`autotile-${prefix}`, canvas);
    }

    private rotateCornersClockwise(c: Corners): Corners {
        // Rotate 90° clockwise: TL->BL, TR->TL, BL->BR, BR->TR
        const [tl, tr, bl, br] = c;
        return [bl, tl, br, tr];
    }

    // Rotates a given frame and adds it as a new texture
    private rotateFrame(frameNum: number, baseKey: string, angle: number, newKey: string) {
        const frame = this.textures.getFrame(baseKey, frameNum);
        if (!frame) {
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext('2d')!;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(
            frame.source.image as any,
            frame.cutX, frame.cutY,
            frame.width, frame.height,
            -frame.width / 2, -frame.height / 2,
            frame.width, frame.height
        );

        this.textures.addCanvas(newKey, canvas);
    }

    create() {
        // Defines which frame in the spritesheet has which corners occupied.
        /*
         * Input has 9 frames
         * # [frame ix]: [tl, tr, bl, br]
         * [0,0]: [1, 1, 1, 1] (no changes)
         * [1,0]: [0, 1, 0, 0] (4 total) [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]
         * [0,1]: [0, 1, 1, 1] (4 total) [1, 1, 1, 0], [1, 0, 1, 1], [1, 1, 0, 1]
         * [1,1]: [0, 1, 1, 0] (2 total) [1, 0, 0, 1]
         * [0,2]: [0, 0, 1, 1] (4 total) [1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1]
        */
        const grassTiles = this.createRotatedTileset('tiles', this.grassCorners, 'grass');
        const sandTiles = this.createRotatedTileset('sand-tiles', this.sandCorners, 'sand');

        this.scene.start('main', {
            grassTiles: grassTiles,
            sandTiles: sandTiles,
        })
    }

    createRotatedTileset(tilesetName: string, corners: Corners[], prefix: string)
        : RotatedTile[] {

        const rotatedTiles: RotatedTile[] = [];
        const seen = new Map<number, number>();
        let nextTileIndex = 0;
        const plainTile = cornersToByte([1, 1, 1, 1]);
        for (let i = 0; i < corners.length; i++) {
            const rawFrame = corners[i];

            let current = rawFrame;
            for (let ci = 0; ci < 4; ci++) {
                const cornerByte = cornersToByte(current);
                const prevCount = seen.get(cornerByte) || 0;

                const tileKey = `${prefix}-${cornerByte}-${prevCount}`;

                seen.set(cornerByte, prevCount + 1);

                this.rotateFrame(i, tilesetName, ci * 90, tileKey);

                rotatedTiles.push({
                    corners: cornerByte,
                    tileIndex: nextTileIndex,
                    textureKey: tileKey
                });

                nextTileIndex++;

                current = this.rotateCornersClockwise(current);

                if (cornerByte == plainTile) {
                    break;
                }
            }
        }

        this.createTilesetCanvas(rotatedTiles, prefix);

        return rotatedTiles;
    }
}