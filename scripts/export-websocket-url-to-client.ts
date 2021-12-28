#!/usr/bin/env node

import clientPackageData from "../client/package.json";
import fs from "fs";
import serviceOutput from "../service/cdk.service.output.json";

const buffer = { ...clientPackageData };

buffer.data.input.urls.server =
  serviceOutput.TdfServiceStack.WebSocketServerFargateServiceServiceURL7A769823.replace(
    "http",
    "ws"
  );

fs.writeFileSync("client/package.json", JSON.stringify(buffer, null, 2));
