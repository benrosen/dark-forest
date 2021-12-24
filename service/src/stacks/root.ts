import { Construct, Stack, StackProps } from "@aws-cdk/core";

import { StaticSite } from "../constructs/static-site";
import { WebSocketServer } from "../constructs/websocket-server";

export default class Root extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new StaticSite(this, "StaticSite", {
      domainName: this.node.tryGetContext("domain"),
      siteSubDomain: this.node.tryGetContext("subdomain"),
    });
    new WebSocketServer(this, "WebSocketServer", {
      containerPath: this.node.tryGetContext("containerPath"),
    });
  }
}
