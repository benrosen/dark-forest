#!/usr/bin/env node

import { App } from "@aws-cdk/core";
import Root from "../src/stacks/root";

new Root(new App(), "TheDarkForestStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
