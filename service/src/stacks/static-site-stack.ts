import { Construct, Stack, StackProps } from "@aws-cdk/core";

import { StaticSite } from "../constructs/static-site";

export default class StaticSiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new StaticSite(this, "StaticSite", {
      domainName: this.node.tryGetContext("domain"),
      siteSubDomain: this.node.tryGetContext("subdomain"),
    });
  }
}