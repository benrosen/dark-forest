#!/usr/bin/env node

import { App } from "@aws-cdk/core";
import Client from "../src/stacks/client";
import Service from "../src/stacks/service";

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new Service(app, { env });
new Client(app, { env });
