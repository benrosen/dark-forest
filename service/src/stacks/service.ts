import { Construct, Stack, StackProps } from "@aws-cdk/core";

import { WebSocketServer } from "../constructs/websocket-server";
import { data } from "../../package.json";

const { stacks } = data.input;

export default class Service extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    super(scope, stacks.service, props);
    new WebSocketServer(this, "WebSocketServer", {
      containerPath: this.node.tryGetContext("containerPath"),
      containerPort: this.node.tryGetContext("containerPort"),
    });
  }
}
