# The Dark Forest: Client

## Data

The `data` object in `package.json` contains configuration values for the application.

### `input`

#### `colors`

##### `debug`

Used for visually debugging the game.

##### `primary`

The primary color of the game.

##### `secondary`

The secondary color of the game.

#### `hertz`

How many times per second is the game updated?

#### `ids`

##### `centeredContent`

Identifies content that is vertically and horizontally centered on the page.

##### `gameContainer`

Identifies the parent container for the Phaser game instance.

##### `postClickContent`

Identifies content that should be shown after the first user interaction, but not before.

##### `preClickContent`

Identifies content that should be shown before the first user interaction, but not after.

##### `viewportContainer`

Identifies the top-level container for UI elements.

#### `player`

##### `radius`

The radius of the circle that visually represents the player.

##### `speed`

The velocity at which the player moves.

#### `trees`

##### `horizontalSamples`

How many samples should be taken in the horizontal axis?

##### `maxRadius`

The maximum radius for circles that visually represent trees.

##### `minRadius`

The minimum radius for circles that visually represent trees.

##### `randomSeed`

A random seed for the simplex noise generator. See the [simplex-noise](https://www.npmjs.com/package/simplex-noise) docs for more info about seeding the noise generator. See [this wikipedia page](https://en.wikipedia.org/wiki/Random_seed) for more information on random seeding in general.

##### `sampleSpacing`

How many pixels should separate each sample in the horizontal and vertical axes?

##### `threshold`

Controls how frequently trees spawn. This value can be any number between 0.0 and 1.0. Higher numbers will result in more trees being spawned.

##### `verticalSamples`

How many samples should be taken in the vertical axis?

#### `urls`

##### `server`

The URL of the websocket server.

## Package Scripts

### `yarn build`

Transpiles and bundles TypeScript code from `src/index.ts` into `dist/index.js` and renders `.css` and `.html` files into the `dist/` directory.

### `yarn bundle`

Uses [esbuild]() to bundle transpiled JavaScript code with its dependencies into a single distributable JavaScript file.

### `yarn render`

Uses [ts-node]() to evaluate `src/html.ts` and `src/css.ts`, which are functions that return HTML and CSS code respectively. The results of these functions are output to corresponding `.html` and `.css` files in the `dist/` directory.

### `yarn transpile`

Uses [tsc]() to transpile TypeScript code into JavaScript according to the settings configured in `tsconfig.json`.

## Reference

- [follow-user-controlled-sprite](https://phaser.io/examples/v3/view/camera/follow-user-controlled-sprite)
- https://angelo-poole.medium.com/2d-raycasting-in-javascript-91551c30355
- https://github.com/Petah/2d-visibility
- https://www.redblobgames.com/articles/visibility/
- https://ncase.me/sight-and-light/
- https://simblob.blogspot.com/2012/07/2d-visibility.html
- http://phaser.io/examples/v3/view/camera/follow-user-controlled-sprite
- http://phaser.io/examples/v3/view/physics/arcade/add-body-to-shape
- https://photonstorm.github.io/phaser3-docs/Phaser.Types.Scenes.html#.SettingsConfig
