import * as Phaser from "phaser";

import { AutoFilter, Noise } from "tone";
import {
  Circle,
  Game,
  PointerDownMessage,
  PointerUpMessage,
  Topic,
  WebSocketClient,
} from "../../types";

import Sockette from "sockette";

const authenticate = async () => {
  // TODO implement
  throw new Error("Not implemented.");
};

const connectToWebSocketApi = async (
  onClose: (event: CloseEvent) => void,
  onError: (event: Event) => void,
  onMaximum: (event: Event) => void,
  onMessage: (message: MessageEvent) => void,
  onOpen: (event: Event) => void,
  onReconnect: (event: Event) => void,
  url: string
): Promise<WebSocketClient> => {
  // const webSocketClient = new Sockette(url, {
  //   onclose: onClose,
  //   onerror: onError,
  //   onmaximum: onMaximum,
  //   onmessage: onMessage,
  //   onopen: onOpen,
  //   onreconnect: onReconnect,
  // });
  return {
    publish: (message: PointerDownMessage | PointerUpMessage) => {
      console.log(message);
      // webSocketClient.json(message);
    },
  };
};

const handleAuthenticateError = (error: Error) => {
  // TODO implement
  throw new Error("Not implemented.");
};

const handleConnectToWebSocketApiError = (error: Error) => {
  // TODO implement
  throw new Error("Not implemented.");
};

const handleWebSocketError = (event: Event) => console.error(event);

const handleWebSocketClose = (event: CloseEvent) =>
  console.info("WebSocket connection closed.");

const handleWebSocketMaximum = (event: Event) =>
  console.warn("WebSocket failed to reconnect; maximum retries exceeded.");

const handleWebSocketOpen = (event: Event) =>
  console.info("WebSocket connection opened.");

const handleWebSocketReconnect = (event: Event) =>
  console.info("WebSocket reconnected.");

const sendWebSocketMessage = <T extends PointerDownMessage | PointerUpMessage>(
  client: WebSocketClient,
  message: T
) => client.publish(message);

const sendPointerWebSocketMessage = <
  T extends PointerUpMessage | PointerDownMessage
>(
  client: WebSocketClient,
  position: { x: number; y: number },
  topic: Topic
) =>
  sendWebSocketMessage<T>(client, {
    position: position,
    timestamp: Date.now(),
    topic: topic,
  } as T);

const sendPointerDownWebSocketMessage = (
  client: WebSocketClient,
  position: { x: number; y: number }
) =>
  sendPointerWebSocketMessage<PointerDownMessage>(
    client,
    position,
    Topic.PointerDown
  );

const sendPointerUpWebSocketMessage = (
  client: WebSocketClient,
  position: { x: number; y: number }
) =>
  sendPointerWebSocketMessage<PointerDownMessage>(
    client,
    position,
    Topic.PointerUp
  );

const createGameClient = async (webSocketApiUrl: string) => {
  const GAME_STATE_EVENT_NAME = "GAME_STATE_EVENT";
  const GAME_STATE_DATA_KEY = "GAME_STATE_DATA";
  const CLIENT_ID_DATA_KEY = "CLIENT_ID_DATA_KEY";

  let graphics: Phaser.GameObjects.Graphics;

  // try {
  //   await authenticate();
  // } catch (error) {
  //   return handleAuthenticateError(error);
  // }

  new Noise("brown")
    .start()
    .connect(new AutoFilter(0.05, 750).start().toDestination());

  const game = new Phaser.Game({
    backgroundColor: 0xd6ecef,
    height: "100%",
    parent: "game",
    scene: {
      preload: async function (this: Phaser.Scene) {
        // DEBUG ONLY
        this.data.set(GAME_STATE_DATA_KEY, {
          players: [],
          trees: [
            { position: { x: 0, y: 120 }, radius: 9 },
            { position: { x: 100, y: 330 }, radius: 10 },
            { position: { x: 35, y: 110 }, radius: 4 },
            { position: { x: 22, y: 230 }, radius: 8 },
            { position: { x: 5, y: 213 }, radius: 15 },
            { position: { x: 73, y: 396 }, radius: 12 },
            { position: { x: 300, y: 200 }, radius: 9 },
            { position: { x: 310, y: 50 }, radius: 10 },
            { position: { x: 235, y: 10 }, radius: 4 },
            { position: { x: 322, y: 30 }, radius: 8 },
            { position: { x: 225, y: 13 }, radius: 15 },
            { position: { x: 273, y: 96 }, radius: 12 },
          ],
        } as Game);
        //
        const webSocketClient = await connectToWebSocketApi(
          handleWebSocketClose,
          handleWebSocketError,
          handleWebSocketMaximum,
          (event: MessageEvent) =>
            game.events.emit(GAME_STATE_EVENT_NAME, event),
          handleWebSocketOpen,
          handleWebSocketReconnect,
          webSocketApiUrl
        );
        this.game.events.on(GAME_STATE_EVENT_NAME, (event: MessageEvent) => {
          console.log(event);
          // TODO parse event before setting
          this.data.set(GAME_STATE_DATA_KEY, event);
        });
        this.input.on(
          Phaser.Input.Events.POINTER_DOWN,
          (pointer: Phaser.Input.Pointer) =>
            sendPointerDownWebSocketMessage(webSocketClient, {
              x: pointer.x,
              y: pointer.y,
            })
        );
        this.input.on(
          Phaser.Input.Events.POINTER_UP,
          (pointer: Phaser.Input.Pointer) =>
            sendPointerUpWebSocketMessage(webSocketClient, {
              x: pointer.x,
              y: pointer.y,
            })
        );
      },
      update: function (this: Phaser.Scene) {
        const gameState = this.data.get(GAME_STATE_DATA_KEY) as Game;
        graphics = graphics ?? this.add.graphics();
        graphics.clear();
        [...gameState.players, ...gameState.trees].forEach((circle: Circle) => {
          graphics.fillStyle(0x101010, 1);
          graphics.fillCircle(
            circle.position.x,
            circle.position.y,
            circle.radius
          );
        });
        // TODO camera follow clientPlayer position
      },
    },
    width: "100%",
  });
};

createGameClient("");
