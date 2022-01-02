import { Game as PhaserGame, Scene as PhaserScene, Physics } from "phaser";

import { Buffer } from "buffer";
import SimplexNoise from "simplex-noise";
import { data } from "../package.json";
import { v4 } from "uuid";

const { colors, hertz, ids, player, trees, urls } = data.input;

// BUG have to go to api.darkforest.click (unsafe) and proceed. then websocket connection will work.
// BUG remote players are not drawn at the same position as they would be if they were local players (see screenshot)
// TODO move position smoothly (remote player objects)
// TODO document; publish docs to github pages
// TODO wind and footstep SFX
// TODO flashlight beams
// TODO flashlight toggle SFX
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
