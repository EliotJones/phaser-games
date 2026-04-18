export type Corners = [number, number, number, number];


export function cornersToByte(corners: Corners) {
    return (corners[0] << 3) | (corners[1] << 2) | (corners[2] << 1) | corners[3];
}

export class WorldMap {
    private readonly cols: number;
    private readonly types: Types[];
    constructor(rows: number, cols: number) {
        this.cols = cols;
        this.types = [];
        for (let rowIx = 0; rowIx < rows; rowIx++) {
            for (let colIx = 0; colIx < cols; colIx++) {
                this.types.push('mud');
            }
        }
    }

    getType(x: number, y: number): Types {
        const ix = y * this.cols + x;
        if (ix > this.types.length) {
            return 'mud';
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

export type Types = 'mud' | 'grass';

export interface RotatedTile {
    corners: number; // store as a nibble 0bTLTRBLBR
    tileIndex: number; // tilemap index
    textureKey: string; // optional if using add.image
}