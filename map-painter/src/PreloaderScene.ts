import { Scene } from "phaser";
import { config } from "./config";
import { Corners, RotatedTile } from "./Models";

export class PreloaderScene extends Scene {
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
    }

    private createTilesetCanvas(tiles: RotatedTile[]) {
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
        this.textures.addCanvas('autotile-grass', canvas);
    }

    private cornersToByte = (corners: Corners) => (corners[0] << 3) | (corners[1] << 2) | (corners[2] << 1) | corners[3];

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
         * Input has 5 frames
         * # [frame ix]: [tl, tr, bl, br]
         * [0,0]: [1, 1, 1, 1] (no changes)
         * [1,0]: [0, 1, 0, 0] (4 total) [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]
         * [0,1]: [0, 1, 1, 1] (4 total) [1, 1, 1, 0], [1, 0, 1, 1], [1, 1, 0, 1]
         * [1,1]: [0, 1, 1, 0] (2 total) [1, 0, 0, 1]
         * [0,2]: [0, 0, 1, 1] (4 total) [1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1]
        */
        const rawFrames: Corners[] = [
            [1, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 1, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 1, 1]];

        const rotatedTiles: RotatedTile[] = [];
        const seen = new Set<number>();
        let nextTileIndex = 0;
        for (let i = 0; i < rawFrames.length; i++) {
            const rawFrame = rawFrames[i];

            let current = rawFrame;
            for (let ci = 0; ci < 4; ci++) {
                const cornerByte = this.cornersToByte(current);

                const tileKey = `grass-${cornerByte}`;

                if (!seen.has(cornerByte)) {
                    seen.add(cornerByte);

                    this.rotateFrame(i, 'tiles', ci * 90, tileKey);

                    rotatedTiles.push({
                        corners: cornerByte,
                        tileIndex: nextTileIndex,
                        textureKey: tileKey
                    });

                    nextTileIndex++;
                }

                current = this.rotateCornersClockwise(current);
            }
        }

        this.createTilesetCanvas(rotatedTiles);
        this.scene.start('main')
    }
}