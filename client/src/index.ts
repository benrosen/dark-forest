import { Game as PhaserGame, Scene as PhaserScene, Physics } from "phaser";

import { Buffer } from "buffer";
import SimplexNoise from "simplex-noise";
import { data } from "../package.json";
import { v4 } from "uuid";

const { colors, hertz, ids, player, trees, urls } = data.input;

/**
 * The `Client` establishes and manages a connection with a WebSocket server
 * and is responsible for sending and receiving network messages.
 *
 * The `Client` can send {@link PlayerState} updates
 * and receive {@link GameState} updates.
 * {@link PlayerState} updates are sent via the `publishPlayerState` method.
 * {@link GameState} updates are passed to the `onGameStateReceived` callback function
 * that is provided via {@link ClientProps}.
 *
 * For more information, see:
 * - {@link ClientProps}
 * - {@link GameState} and {@link PlayerState}
 * - [MDN WebSocket Object Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 */
class Client {
  public readonly publishPlayerState: (state: PlayerState) => void;
  constructor(props: ClientProps) {
    const socket = new WebSocket(props.webSocketUrl);
    socket.onmessage = (event: MessageEvent) =>
      props.onGameStateReceived(JSON.parse(event.data));
    this.publishPlayerState = (state: PlayerState) =>
      socket.readyState === WebSocketReadyState.Open &&
      socket.send(JSON.stringify(state));
  }
}

interface ClientProps {
  onGameStateReceived: (state: GameState) => void;
  webSocketUrl: string;
}

/**
 * The `Game` creates and manages a [Phaser.Game](https://photonstorm.github.io/phaser3-docs/Phaser.Game.html) instance
 * and is responsible for passing state in and out of the game instance.
 *
 * The `Game` can receive {@link GameState} updates
 * and send {@link PlayerState} updates.
 * {@link GameState} updates are passed through the `public` `state` [setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set)
 * to the game instance's [event system](https://photonstorm.github.io/phaser3-docs/Phaser.Events.EventEmitter.html)
 * as {@link GameEvent.GameStateChanged} events.
 * {@link PlayerState} updates are passed to the `onLocalPlayerStateChanged` callback
 * that is provided via {@link GameProps}.
 *
 * In-game logic is handled by the {@link Scene} class.
 *
 * For more information, see:
 * - {@link GameProps}
 * - {@link GameState} and {@link PlayerState}
 * - {@link Scene}
 * - [Phaser `EventEmitter` Documentation](https://photonstorm.github.io/phaser3-docs/Phaser.Events.EventEmitter.html)
 * - [Phaser `Game.Config` Documentation](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Core.html#.GameConfig)
 */
class Game {
  private readonly _game: PhaserGame;
  public set state(value: GameState) {
    this._game.events.emit(GameEvent.GameStateChanged, value);
  }
  constructor(props: GameProps) {
    this._game = new PhaserGame({
      backgroundColor: props.darkColor,
      fps: {
        target: props.hertz,
        forceSetTimeOut: true,
      },
      height: "100%",
      parent: props.parentElementId,
      physics: {
        default: "arcade",
      },
      pixelArt: true,
      roundPixels: true,
      scene: [Scene],
      width: "100%",
    });
    this._game.events.on(
      GameEvent.LocalPlayerStateChanged,
      (state: PlayerState) => props.onLocalPlayerStateChanged(state)
    );
  }
}

/**
 * The `GameClient` creates, manages, and connects a {@link Client} and a {@link Game}.
 *
 * The `GameClient` receives {@link GameState} updates from the {@link Client}
 * and sends {@link PlayerState} updates back to the {@link Client}.
 *
 * For more information, see:
 * - {@link GameClientProps}
 * - {@link GameState} and {@link PlayerState}
 * - {@link Client} and {@link Game}
 * - {@link Scene}
 */
class GameClient {
  private readonly _client: Client;
  private readonly _game: Game;
  constructor(props: GameClientProps) {
    this._client = new Client({
      onGameStateReceived: (state: GameState) => (this._game.state = state),
      webSocketUrl: props.webSocketUrl,
    });
    this._game = new Game({
      darkColor: props.darkColor,
      hertz: props.hertz,
      lightColor: props.lightColor,
      onLocalPlayerStateChanged: (state: PlayerState) =>
        this._client.publishPlayerState(state),
      parentElementId: props.parentElementId,
    });
  }
}

interface GameClientProps {
  darkColor: number;
  hertz: number;
  lightColor: number;
  parentElementId: string;
  webSocketUrl: string;
}

enum GameEvent {
  GameStateChanged = "GAME_STATE_CHANGED",
  LocalPlayerStateChanged = "LOCAL_PLAYER_STATE_CHANGED",
}

interface GameProps {
  darkColor: number;
  hertz: number;
  lightColor: number;
  onLocalPlayerStateChanged: (state: PlayerState) => void;
  parentElementId: string;
}

interface GameState {
  [playerId: string]: PlayerState;
}

type PlayerState = Point;

type RemotePlayerState = PlayerState & { id: string };

interface Point {
  x: number;
  y: number;
}

type Sample = Point & { value: number };

/**
 * The `Scene` creates and manages the game world,
 * which includes the level, the local player, the camera, and the remote players.
 *
 * ## The forest
 *
 * The game takes place in an infinite 2D forest, which is viewed from above.
 * The forest consists of trees, which are visually represented as circles.
 * Tree circles are positioned randomly (but consistently) with the help of seeded simplex noise.
 *
 * Not all trees have the same diameter;
 * the diameter of a tree circle is derived from the simplex noise value sampled at the tree's position.
 * The sampled noise value is also used to determine whether a tree should be drawn at all.
 *
 * Because the game world is infinite, it contains an infinite number of trees.
 * For performance reasons, only the trees nearest to the player are rendered.
 * As the player moves around the world,
 * tree game objects are dynamically created and destroyed as they come into and out of the player's view.
 *
 * The values that control tree spawning, tree diameter,
 * and other configurable settings are defined in [package.json](https://github.com/benrosen/dark-forest/blob/0c0a05e0a787c0a860d1f93d08e26aeedb00a258/client/package.json)
 * and documented in client directory's [README file](https://github.com/benrosen/dark-forest/blob/0c0a05e0a787c0a860d1f93d08e26aeedb00a258/client/README.md).
 *
 * ## The local player
 *
 * Players are visually represented as a circles that move around the level.
 * The player game object is controlled by the arrow keys on the keyboard.
 * Pressing arrow keys sets the velocity of the physics body attached to the player,
 * which results in the player moving around the level.
 *
 * Physical collisions are enabled between the local player and the tree game objects
 * via [Phaser's Arcade Physics Engine](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html).
 *
 * The `Scene` broadcasts the {@link PlayerState} of the local player at an interval via the game's event system.
 *
 * Player diameter, speed, and other configurable settings are defined in
 * [package.json](https://github.com/benrosen/dark-forest/blob/0c0a05e0a787c0a860d1f93d08e26aeedb00a258/client/package.json)
 * and documented in client directory's [README file](https://github.com/benrosen/dark-forest/blob/0c0a05e0a787c0a860d1f93d08e26aeedb00a258/client/README.md).
 *
 * The game camera follows the position of the local player.
 *
 * ## The remote players
 *
 * Just like the local player, remote players are visually represented as circles that move around the level.
 * However, unlike the local player, remote players are controlled by remote {@link PlayerState} objects.
 * {@link PlayerState} objects hold position values, and are contained in {@link GameState} updates.
 * {@link GameState} updates are received via the game's event system.
 * Remote player game objects are constantly moved
 * towards the position value contained in the most recently received {@link PlayerState} object.
 *
 * Remote player game objects do not collide with other game objects in the world, like trees or other players.
 *
 * Remote player game objects use the same configurable values as the local player game object,
 * which are defined in [package.json](https://github.com/benrosen/dark-forest/blob/0c0a05e0a787c0a860d1f93d08e26aeedb00a258/client/package.json)
 * and documented in client directory's [README file](https://github.com/benrosen/dark-forest/blob/0c0a05e0a787c0a860d1f93d08e26aeedb00a258/client/README.md).
 *
 * For more information, see:
 * - {@link GameState} and {@link PlayerState}
 * - {@link GameClient}
 * - [Random Seed Wikipedia Article](https://en.wikipedia.org/wiki/Random_seed)
 * - [Simplex Noise Wikipedia Article](https://en.wikipedia.org/wiki/Simplex_noise)
 * - [`simplex-noise` Package Documentation](https://www.npmjs.com/package/simplex-noise)
 * - [Phaser `circle` Documentation](https://newdocs.phaser.io/docs/3.54.0/focus/Phaser.GameObjects.GameObjectFactory-circle)
 * - [Phaser "Cursor Keys" Example](https://phaser.io/examples/v3/view/input/keyboard/cursor-keys)
 * - [Phaser "Circle Body" Example](https://phaser.io/examples/v2/arcade-physics/circle-body)
 * - [Phaser `Camera.startFollow` Documentation](https://newdocs.phaser.io/docs/3.54.0/focus/Phaser.Cameras.Scene2D.Camera-startFollow)
 * - [Phaser `EventEmitter` Documentation](https://photonstorm.github.io/phaser3-docs/Phaser.Events.EventEmitter.html)
 */
class Scene extends PhaserScene {
  private get _body() {
    return this._player.body as Phaser.Physics.Arcade.Body;
  }
  private _cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private _debug: Phaser.GameObjects.Graphics;
  private _noise: SimplexNoise;
  private _player: Phaser.GameObjects.Arc;
  private _trees: Sample[] = [];
  private _treeGroup: Physics.Arcade.StaticGroup;
  private _remotePlayerStates: RemotePlayerState[] = [];
  private _remotePlayerGroup: Physics.Arcade.Group;
  private set remotePlayerStates(value: RemotePlayerState[]) {
    value
      .filter(
        (remotePlayer) => !this._remotePlayerStates.includes(remotePlayer)
      )
      .forEach((remotePlayerToCreate) =>
        this._remotePlayerGroup.add(
          this.add
            .circle(
              remotePlayerToCreate.x,
              remotePlayerToCreate.y,
              player.radius,
              getHexInteger(colors.secondary)
            )
            .setName(remotePlayerToCreate.id)
            .setOrigin(0)
        )
      );
    this._remotePlayerStates
      .filter((remotePlayer) => !value.includes(remotePlayer))
      .forEach((remotePlayerToDelete) =>
        this.children.getByName(remotePlayerToDelete.id).destroy()
      );
    value
      .filter((remotePlayer) => this._remotePlayerStates.includes(remotePlayer))
      .forEach((remotePlayerToUpdate) =>
        this.physics.moveTo(
          this.children.getByName(remotePlayerToUpdate.id),
          remotePlayerToUpdate.x,
          remotePlayerToUpdate.y
        )
      );
    this._remotePlayerStates = value;
  }
  private set trees(value: Sample[]) {
    value
      .filter((tree) => !this._trees.includes(tree))
      .forEach((treeToCreate) =>
        this._treeGroup.add(
          this.add
            .circle(
              treeToCreate.x,
              treeToCreate.y,
              lerp(
                trees.minRadius,
                trees.maxRadius,
                inverseLerp(trees.threshold, 1, treeToCreate.value)
              ),
              getHexInteger(colors.secondary)
            )
            .setName(getTreeId(treeToCreate))
        )
      );
    this._trees
      .filter((tree) => !value.includes(tree))
      .forEach((treeToDestroy) =>
        this.children.getByName(getTreeId(treeToDestroy)).destroy()
      );
    this._trees = value;
  }
  constructor() {
    super({
      key: v4(),
      active: true,
    });
  }
  create() {
    this._noise = new SimplexNoise(trees.randomSeed);
    this._cursorKeys = this.input.keyboard.createCursorKeys();
    this._debug = this.add.graphics({
      lineStyle: {
        alpha: 1,
        color: getHexInteger(colors.debug),
        width: 1,
      },
    });
    this._player = this.add.circle(
      0,
      0,
      player.radius,
      getHexInteger(colors.secondary)
    );
    this.physics.add.existing(this._player, false);
    this._remotePlayerGroup = this.physics.add.group({ randomKey: true });
    this._treeGroup = this.physics.add.staticGroup({ randomKey: true });
    this.cameras.main.startFollow(this._player, true, 0.5, 0.5);
    this.game.events.on(
      GameEvent.GameStateChanged,
      (state: GameState) =>
        (this.remotePlayerStates = Object.keys(state).map((clientId) => ({
          id: clientId,
          ...(JSON.parse(
            Buffer.from(
              (state[clientId] as unknown as any).data.data
            ).toString()
          ) as PlayerState),
        })))
    );
  }
  update() {
    this._body.setVelocity(0);
    if (this._cursorKeys.left.isDown) {
      this._body.setVelocityX(-player.speed);
    } else if (this._cursorKeys.right.isDown) {
      this._body.setVelocityX(player.speed);
    }
    if (this._cursorKeys.up.isDown) {
      this._body.setVelocityY(-player.speed);
    } else if (this._cursorKeys.down.isDown) {
      this._body.setVelocityY(player.speed);
    }
    const nearestSamplePoint = {
      x:
        roundToNearestMultiple(this._body.position.x, trees.sampleSpacing) +
        player.radius,
      y:
        roundToNearestMultiple(this._body.position.y, trees.sampleSpacing) +
        player.radius,
    };
    const topLeftSamplePoint = {
      x:
        nearestSamplePoint.x -
        trees.sampleSpacing * (trees.horizontalSamples / 2),
      y:
        nearestSamplePoint.y -
        trees.sampleSpacing * (trees.verticalSamples / 2),
    };
    const samples: (Point & { value: number })[] = [];
    for (let x = 0; x < trees.horizontalSamples; x++) {
      for (let y = 0; y < trees.verticalSamples; y++) {
        const point = {
          x: topLeftSamplePoint.x + x * trees.sampleSpacing,
          y: topLeftSamplePoint.y + y * trees.sampleSpacing,
        };
        samples.push({
          x: point.x,
          y: point.y,
          value: this._noise.noise2D(point.x, point.y),
        });
      }
    }
    this.trees = samples.filter((sample) => sample.value >= trees.threshold);
    this.physics.world.collide(this._player, this._treeGroup);
    this._debug.clear();
    this.game.events.emit(GameEvent.LocalPlayerStateChanged, {
      x: this._body.position.x,
      y: this._body.position.y,
    } as PlayerState);
  }
}

enum WebSocketReadyState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const getHexInteger = (hexString: string) =>
  parseInt(hexString.replace(/^#/, ""), 16);

const getTreeId = (point: Point) => `${point.x}x${point.y}`;

const inverseLerp = (min: number, max: number, value: number) =>
  clamp((value - min) / (max - min));

const lerp = (min: number, max: number, interpolant: number) =>
  min * (1 - interpolant) + max * interpolant;

const roundToNearestMultiple = (value: number, multiple: number) =>
  Math.round(value / multiple) * multiple;

document.onclick = () => {
  document.onclick = undefined;
  document.getElementById(ids.preClickContent).hidden = true;
  document.getElementById(ids.postClickContent).hidden = false;
  new GameClient({
    darkColor: getHexInteger(colors.primary),
    hertz,
    lightColor: getHexInteger(colors.secondary),
    parentElementId: ids.gameContainer,
    webSocketUrl: urls.server,
  });
};
