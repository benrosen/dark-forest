# server

## data

The `data` object in `package.json` contains configuration values for the application.

### `HERTZ`

Controls the number of times per second that the WebSocket server broadcasts state updates to clients.

### `PORT`

Defines the Docker port that WebSocket clients will connect to.

### `PROXY`

Defines the local port that exposes the Docker port.

### `TAG`

Identifies the Docker image.

## scripts

### `yarn build`

> :warning: You must have Docker installed locally to run this script.

Runs `docker build` and tags the build with the value supplied by the `TAG` data defined in `package.json`. For more information on the `docker build` command, consult the [Docker reference materials]().

### `yarn start`

> :warning: You must have Docker installed locally to run this script.

Runs `docker run` with the values supplied by the `PROXY`, `PORT`, and `TAG` data defined in `package.json`. For more information on the `docker run` command, consult the [Docker reference materials]().

### `yarn serve`

Starts the websocket server.
