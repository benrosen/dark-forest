import { RawData, WebSocket, WebSocketServer } from "ws";

import { data } from "./package.json";
import { v4 } from "uuid";

const state: {
  [clientId: string]: { data: RawData; isBinary: boolean };
} = {};

console.log("Creating WebSocket server...");

const server = new WebSocketServer({
  clientTracking: true,
  port: data.PORT,
});

console.log("WebSocket server created!");

server.on("connection", (client) => {
  const clientId = v4();
  console.log(clientId, "connected at", Date.now());
  client
    .on("close", () => {
      console.log(clientId, "closed at", Date.now());
      state[clientId] = undefined;
    })
    .on("message", (data, isBinary) => {
      console.log(clientId, "sent", data, "at", Date.now());
      state[clientId] = { data, isBinary };
    });
});

setInterval(() => {
  server.clients.forEach(
    (client) => client.readyState === WebSocket.OPEN && client.send(state)
  );
  console.log("broadcast", state, "at", Date.now());
}, 1000 / data.HERTZ);
