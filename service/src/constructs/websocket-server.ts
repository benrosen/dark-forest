#!/usr/bin/env node

// Source example (Fargate): https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/ecs/fargate-service-with-local-image/index.ts
// Source example (ALB HTTPS): https://docs.aws.amazon.com/cdk/api/v1/docs/aws-ecs-patterns-readme.html#configure-https-on-an-applicationloadbalancedfargateservice

import * as route53 from "@aws-cdk/aws-route53";

import { AwsLogDriver, Cluster, ContainerImage } from "@aws-cdk/aws-ecs";
import { Construct, Stack } from "@aws-cdk/core";

import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { SslPolicy } from "@aws-cdk/aws-elasticloadbalancingv2";
import { Vpc } from "@aws-cdk/aws-ec2";

export interface WebSocketServerProps {
  apiSubDomain: string;
  containerPath: string;
  containerPort: number;
  domainName: string;
}

export class WebSocketServer extends Construct {
  constructor(parent: Stack, name: string, props: WebSocketServerProps) {
    super(parent, name);
    const vpc = new Vpc(parent, "WebSocketServerVpc", { maxAzs: 2 });
    const cluster = new Cluster(parent, "WebSocketServerCluster", { vpc });
    const logDriver = new AwsLogDriver({ streamPrefix: "WebSocketServer" });
    const domainZone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    });
    const apiDomain = props.apiSubDomain + "." + props.domainName;
    const certificate = Certificate.fromCertificateArn(
      this,
      "Cert",
      "arn:aws:acm:us-east-1:326238338403:certificate/79b300ec-8cb9-438f-89ff-3a1e8ceb0d12"
    );
    new ApplicationLoadBalancedFargateService(
      parent,
      "WebSocketServerFargateService",
      {
        cluster,
        certificate,
        sslPolicy: SslPolicy.RECOMMENDED,
        domainName: apiDomain,
        domainZone,
        redirectHTTP: true,
        taskImageOptions: {
          containerPort: props.containerPort,
          image: ContainerImage.fromAsset(props.containerPath),
          logDriver,
        },
      }
    ).targetGroup.configureHealthCheck({ healthyHttpCodes: "426" });
  }
}
