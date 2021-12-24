import { Cluster, ContainerImage } from "@aws-cdk/aws-ecs";
import { Construct, Stack } from "@aws-cdk/core";

import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { Vpc } from "@aws-cdk/aws-ec2";

export interface WebSocketServerProps {
  containerPath: string;
}

export class WebSocketServer extends Construct {
  constructor(parent: Stack, name: string, props: WebSocketServerProps) {
    super(parent, name);
    const vpc = new Vpc(parent, "WebSocketServerVpc", { maxAzs: 2 });
    const cluster = new Cluster(parent, "WebSocketServerCluster", { vpc });
    new ApplicationLoadBalancedFargateService(
      parent,
      "WebSocketServerFargateService",
      {
        cluster,
        taskImageOptions: {
          image: ContainerImage.fromAsset(props.containerPath),
        },
      }
    );
  }
}
