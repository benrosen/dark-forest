import * as Phaser from "phaser";

import {
  PointerDownMessage,
  PointerUpMessage,
  Topic,
  WebSocketClient,
} from "../../types";

import { Game } from "phaser";
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
  const webSocketClient = new Sockette(url, {
    onclose: onClose,
    onerror: onError,
    onmaximum: onMaximum,
    onmessage: onMessage,
    onopen: onOpen,
    onreconnect: onReconnect,
  });
  return {
    publish: (message: PointerDownMessage | PointerUpMessage) =>
      webSocketClient.json(message),
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

const handlePointerDownEvents = (
  htmlElement: HTMLElement,
  onPointerDown: (event: PointerEvent) => void
) => htmlElement.addEventListener("pointerdown", onPointerDown);

const handlePointerUpEvents = (
  htmlElement: HTMLElement,
  onPointerUp: (event: PointerEvent) => void
) => htmlElement.addEventListener("pointerup", onPointerUp);

const handleWebSocketError = (event: Event) => console.error(event);

const handleWebSocketClose = (event: CloseEvent) =>
  console.info("WebSocket connection closed.");

const handleWebSocketMaximum = (event: Event) =>
  console.warn("WebSocket failed to reconnect; maximum retries exceeded.");

// TODO call renderGameState() with event payload (game state)
const handleWebSocketMessage = (event: MessageEvent) => console.info(event);

const handleWebSocketOpen = (event: Event) =>
  console.info("WebSocket connection opened.");

const handleWebSocketReconnect = (event: Event) =>
  console.info("WebSocket reconnected.");

const renderGameState = (state: Game) => {
  // TODO implement
  throw new Error("Not implemented.");
};

const sendWebSocketMessage = <T extends PointerDownMessage | PointerUpMessage>(
  client: WebSocketClient,
  message: T
) => client.publish(message);

const sendPointerDownWebSocketMessage = (client: WebSocketClient) =>
  sendWebSocketMessage<PointerDownMessage>(client, {
    position: { x: 0, y: 0 },
    timestamp: Date.now(),
    topic: Topic.PointerDown,
  });

const sendPointerUpWebSocketMessage = (client: WebSocketClient) =>
  sendWebSocketMessage<PointerUpMessage>(client, {
    position: { x: 0, y: 0 },
    timestamp: Date.now(),
    topic: Topic.PointerUp,
  });

// set up build script to copy html and css files to dist/ and transpile index.ts to dist/index.js
// import this default export function and call it from index.html

const createGameClient = async (
  pointerTarget: HTMLElement,
  webSocketApiUrl: string
) => {
  try {
    await authenticate();
  } catch (error) {
    return handleAuthenticateError(error);
  }
  let webSocketClient: WebSocketClient;
  try {
    webSocketClient = await connectToWebSocketApi(
      handleWebSocketClose,
      handleWebSocketError,
      handleWebSocketMaximum,
      handleWebSocketMessage,
      handleWebSocketOpen,
      handleWebSocketReconnect,
      webSocketApiUrl
    );
  } catch (error) {
    return handleConnectToWebSocketApiError(error);
  }
  // TODO handle errors
  handlePointerDownEvents(pointerTarget, () =>
    sendPointerDownWebSocketMessage(webSocketClient)
  );
  // TODO handle errors
  handlePointerUpEvents(pointerTarget, () =>
    sendPointerUpWebSocketMessage(webSocketClient)
  );
};

new Phaser.Game({
  backgroundColor: 0x0000ff,
  parent: "game",
  height: "100%",
  width: "100%",
});
