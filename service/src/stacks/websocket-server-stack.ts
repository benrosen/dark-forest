import { Construct, Stack, StackProps } from "@aws-cdk/core";

import { WebSocketServer } from "../constructs/websocket-server";

export default class WebSocketServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new WebSocketServer(this, "WebSocketServer", {
      containerPath: this.node.tryGetContext("containerPath"),
      containerPort: this.node.tryGetContext("containerPort"),
    });
  }
}
