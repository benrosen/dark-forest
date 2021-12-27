import { Construct, Stack, StackProps } from "@aws-cdk/core";

import { StaticSite } from "../constructs/static-site";
import { data } from "../../package.json";

const { stacks } = data.input;

export default class Client extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    super(scope, stacks.client, props);
    new StaticSite(this, "StaticSite", {
      domainName: this.node.tryGetContext("domain"),
      siteSubDomain: this.node.tryGetContext("subdomain"),
    });
  }
}
