# service

## package scripts

### `yarn cdk`

For more information on the `cdk` command, consult the [AWS CDK CLI reference materials](https://docs.aws.amazon.com/cdk/latest/guide/cli.html).

## static site

```mermaid
flowchart LR
dist["../client/dist/"] --> s3 --> client
```

The `../client/dist/` directory is published to an S3 bucket that is hosted via CloudFront and Route53 at https://www.darkforest.click.

## multiplayer

## reference

- https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript
- https://edwinradtke.com/eventtargets
- https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/lambda-cron
- https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/api-websocket-lambda-dynamodb
- https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-sqs.Queue.html
- https://github.com/mozilla/BrowserQuest
- http://shajisethu.blogspot.com/2006/01/chatty-or-chunky-interfaces.html
- https://www.npmjs.com/package/ws
- https://blog.jeffbryner.com/2020/07/20/aws-cdk-docker-explorations.html
- https://github.com/lrutten/docker-nodejs-ws
- https://www.giacomovacca.com/2015/01/dockerize-nodejs-websocket-server-in-5.html
- https://techholding.co/blog/aws-websocket-alb-ecs/
- https://docs.docker.com/get-started/02_our_app/
- https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/ecs/fargate-service-with-local-image
- https://medium.com/containers-on-aws/building-a-socket-io-chat-app-and-deploying-it-using-aws-fargate-86fd7cbce13f
