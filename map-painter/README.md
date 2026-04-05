# Map Painter

Experimenting with dynamic tiling. This is an isolated experiment to help build out a randomized tilemap terrain generation.

Most tilesets require 47, 16 or 15 piece tiling as well as the use of autotilers. The dual grid system approach reduces this to a theoretical minimum of 5 tiles.

The dual grid system uses a world-grid which stores information about what the tile actually is, versus the offset-grid used for rendering. The offset-grid is offset by half a tile width. This means it contains 4 corners of the adjacent world-grid tiles with their corresponding tile types:

```
[ tl tr ]
[ bl br ]
```

If we're looking at just the grass layer (1: present, 0: absent) a full tile is:

```
[ 1 1 ]
[ 1 1 ]
```

Then there are 15 possible tile types for the render layer:

```
[ 1 1 ] [ 1 0 ] [ 1 1 ] [ 1 1 ] [ 0 0 ]
[ 1 1 ] [ 1 1 ] [ 0 1 ] [ 1 0 ] [ 1 1 ] ...
```

But most of these are rotations of the same 5 tiles:

```
[ 1 1 ] [ 1 1 ] [ 1 1 ] [ 1 0 ] [ 1 0 ]
[ 1 1 ] [ 1 0 ] [ 0 0 ] [ 0 0 ] [ 0 1 ]
```

So we can define a tilemap with just 5 tiles and generate the full set of 15 at load time (6th corner is just mud):

![assets\tiles](assets\tiles\five-grid.png)

This defines the following 5 tiles when reading left-to-right, top-to-bottom:

```
1111
0100
1101
0110
0011
```

## TODO:

- Calculate the offset grid tiles from the world grid
- Add the ability for the user to draw
- Add another tile type
- Improve tile display
- Add randomize
- Add variation to grass tiles
- Increase grid size
- Zoom and pan

## Development commands

- `npm run dev`: Start the dev server.
- `npm run build`: Build the production file.

When running:

- Press 'w': toggle the debug world grid
- Press 'o': toggle the debug offset grid

## Sources

- [Draw fewer tiles by jess::codes](https://youtu.be/jEWFSv3ivTg)
- [Auto-Tiling while drawing only 5 tiles by Nonsensical 2D](https://youtu.be/aWcCNGen0cM)