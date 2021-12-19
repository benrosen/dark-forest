# The Dark Forest: Client

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
