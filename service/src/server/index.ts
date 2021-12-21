import { RawData, WebSocket, WebSocketServer } from "ws";

import { data } from "./package.json";
import { v4 } from "uuid";

const state: {
  [clientId: string]: { data: RawData; isBinary: boolean };
} = {};

const server = new WebSocketServer({
  clientTracking: true,
  port: data.PORT,
});

server.on("connection", (client) => {
  const clientId = v4();
  client
    .on("close", () => (state[clientId] = undefined))
    .on("message", (data, isBinary) => (state[clientId] = { data, isBinary }));
});

setInterval(
  () =>
    server.clients.forEach(
      (client) => client.readyState === WebSocket.OPEN && client.send(state)
    ),
  1000 / data.HERTZ
);
