#!/usr/bin/env node

import { RawData, WebSocket, WebSocketServer } from "ws";

import { data } from "./package.json";
import { v4 } from "uuid";

const { port, hertz } = data.input;

const state: {
  [clientId: string]: { data: RawData; isBinary: boolean };
} = {};

console.log("Creating WebSocket server...");

const server = new WebSocketServer({
  clientTracking: true,
  port,
});

console.log("WebSocket server created!");

server.on("connection", (client) => {
  const clientId = v4();
  console.log(clientId, "connected at", Date.now());
  const timer = setInterval(() => {
    const payload = { ...state };
    delete payload[clientId];
    client.readyState === WebSocket.OPEN &&
      client.send(JSON.stringify(payload));
    console.log("sent", payload, "to", clientId, "at", Date.now());
  }, 1000 / hertz);
  client
    .on("close", () => {
      console.log(clientId, "closed at", Date.now());
      clearInterval(timer);
      delete state[clientId];
    })
    .on("message", (data, isBinary) => {
      console.log(clientId, "sent", data, "at", Date.now());
      state[clientId] = { data, isBinary };
    });
});
