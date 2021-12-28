import { Game as PhaserGame, Scene } from "phaser";

import { data } from "../package.json";

const { colors, hertz, ids, urls } = data.input;

class Client {
  public readonly publishPlayerState: (state: PlayerState) => void;
  constructor(props: ClientProps) {
    const socket = new WebSocket(props.webSocketUrl);
    socket.onmessage = (event: MessageEvent) =>
      props.onGameStateReceived(JSON.parse(event.data));
    this.publishPlayerState = (state: PlayerState) =>
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
      scene: {
        preload: async function (this: Scene) {
          console.log("preload");
        },
        create: async function (this: Scene) {
          console.log("create");
        },
        update: async function (this: Scene) {
          console.log("update");
        },
      },
      width: "100%",
    });
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

interface PlayerState {}

const getHexInteger = (hexString: string) =>
  parseInt(hexString.replace(/^#/, ""), 16);

document.onclick = () => {
  document.getElementById(ids.preClickContent).hidden = true;
  document.getElementById(ids.postClickContent).hidden = false;
  new GameClient({
    darkColor: getHexInteger(colors.dark),
    hertz,
    lightColor: getHexInteger(colors.light),
    parentElementId: ids.gameContainer,
    webSocketUrl: urls.server,
  });
};
