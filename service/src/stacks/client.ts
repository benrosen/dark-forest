import { Construct, Stack, StackProps } from "@aws-cdk/core";

import { StaticSite } from "../constructs/static-site";

export default class Client extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    super(scope, "TDF_ClientStack", props);
    new StaticSite(this, "StaticSite", {
      domainName: this.node.tryGetContext("domain"),
      siteSubDomain: this.node.tryGetContext("subdomain"),
    });
  }
}
