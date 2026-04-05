// Using virtual scaling to avoid tile seams from floating point errors while displaying at a higher zoom
export const NATIVE_WIDTH = 350;
export const NATIVE_HEIGHT = 300;
export const SCALE = 2;

export const AssetKeys = {
    tilesImage: 'tiles',
    tilemap: 'tilemap',
    bomb: 'bomb',
    atlas: 'atlas',
    scorebar: 'scorebar',
    sounds: {
        music: 'bg-music',
        coin: 'coin',
        gameOver: 'game-over',
        itemCollected: 'item-collected',
        powerUpActivated: 'power-up',
    },
    background: {
        bg: 'bg',
        close: 'close',
        mid: 'mid',
        far: 'far',
    }
};

export interface GameInputState {
    goLeft: boolean;
    goRight: boolean;
    jump: boolean;
    activatePowerUp: boolean;
}