import { Construct, Stack, StackProps } from "@aws-cdk/core";

import { WebSocketServer } from "../constructs/websocket-server";

export default class Service extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    super(scope, "TDF_ServiceStack", props);
    new WebSocketServer(this, "WebSocketServer", {
      containerPath: this.node.tryGetContext("containerPath"),
      containerPort: this.node.tryGetContext("containerPort"),
    });
  }
}
