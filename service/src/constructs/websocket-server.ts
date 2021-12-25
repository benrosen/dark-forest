#!/usr/bin/env node

// Source example: https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/ecs/fargate-service-with-local-image/index.ts

import { AwsLogDriver, Cluster, ContainerImage } from "@aws-cdk/aws-ecs";
import { Construct, Stack } from "@aws-cdk/core";

import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { Vpc } from "@aws-cdk/aws-ec2";

export interface WebSocketServerProps {
  containerPath: string;
  containerPort: number;
}

export class WebSocketServer extends Construct {
  constructor(parent: Stack, name: string, props: WebSocketServerProps) {
    super(parent, name);
    const vpc = new Vpc(parent, "WebSocketServerVpc", { maxAzs: 2 });
    const cluster = new Cluster(parent, "WebSocketServerCluster", { vpc });
    const logDriver = new AwsLogDriver({ streamPrefix: "WebSocketServer" });
    new ApplicationLoadBalancedFargateService(
      parent,
      "WebSocketServerFargateService",
      {
        cluster,
        taskImageOptions: {
          containerPort: props.containerPort,
          image: ContainerImage.fromAsset(props.containerPath),
          logDriver,
        },
      }
    ).targetGroup.configureHealthCheck({ healthyHttpCodes: "426" });
  }
}
