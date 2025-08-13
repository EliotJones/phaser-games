Sidescrolling platformer in Phaser 3 and Typescript using Tiled map editor.

Player must collect fruits in the goals layer while avoiding the lava and the water.

Jump potions are available in the Goals layer.

## Dev commands:

- **Development server**: `npm run dev` (starts Vite dev server)
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **TypeScript check**: `tsc --noEmit` (for type checking without building)

## To-dos

- Collect fruits
- Show score
- Double jump timer decay and prevent double jump if you hit your head
- Freeze and show restart on water/lava
- Add enemies
- Add jumping on enemies kills them
- Fix display scaling issues
- Add edge of map effects
- Music and SFX
- Add potion effect and prevent misuse (left jump only)
- Add potion for final jump
- Add game completed
- Add timer and score UX
- Add sky
- Add bouncing danger, bomb sprite?
- Add spikes
- Replace player character sprite
- Bombs are neutral, they run from the player and hide in the ground, player can pick them up with action key (F) and throw them.

## Credits

- Pickup sound Sound Effect by <a href="https://pixabay.com/users/alexis_gaming_cam-50011695/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=367087">ALEXIS_GAMING_CAM</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=367087">Pixabay</a>
- Powerup sound Sound Effect by <a href="https://pixabay.com/users/ribhavagrawal-39286533/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230548">Ribhav Agrawal</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230548">Pixabay</a>