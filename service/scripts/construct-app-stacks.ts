#!/usr/bin/env node

import { App } from "@aws-cdk/core";
import StaticSiteStack from "../src/stacks/static-site-stack";
import WebSocketServerStack from "../src/stacks/websocket-server-stack";

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new WebSocketServerStack(app, "WebSocketServerStack", { env });
new StaticSiteStack(app, "StaticSiteApp", { env });
