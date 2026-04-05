export type Corners = [number, number, number, number];

export class WorldMap {
    private readonly cols: number;
    private readonly types: Types[];
    constructor(rows: number, cols: number) {
        this.cols = cols;
        this.types = [];
        for (let rowIx = 0; rowIx < rows; rowIx++) {
            for (let colIx = 0; colIx < cols; colIx++) {
                this.types.push('dirt');
            }
        }
    }

    getType(x: number, y: number): Types {
        const ix = y * this.cols + x;
        if (ix > this.types.length) {
            return 'dirt';
        }

        return this.types[ix];
    }

    setType(x: number, y: number, type: Types) {
        const ix = y * this.cols + x;
        if (ix > this.types.length) {
            console.log('Out of range');
            return
        }

        this.types[ix] = type;
    }
}

export type Types = 'dirt' | 'grass';

export interface RotatedTile {
    corners: number; // store as a nibble 0bTLTRBLBR
    tileIndex: number; // tilemap index
    textureKey: string; // optional if using add.image
}