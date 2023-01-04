import * as fs from 'fs'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { createPubSub, createSchema, createYoga } from 'graphql-yoga'
import { useServer } from 'graphql-ws/lib/use/ws'
import Mutation from './resolvers/Mutation.js'
import Subscription from './resolvers/Subscription.js';
import Query from './resolvers/Query.js'
import RoomModel from './models/Room.js'
import express from 'express';
import path from 'path'
import { useDisableIntrospection } from '@envelop/disable-introspection';

const app = express();
const pubsub = createPubSub();
const yoga = createYoga({
  schema: createSchema({
    typeDefs: fs.readFileSync(
      './src/schema.graphql',
      'utf-8'
    ),
    resolvers: {
      Mutation,
      Subscription,
      Query
    },
  }),
  context: {
    pubsub,
    RoomModel,
  },
  graphiql: {
    subscriptionsProtocol: 'WS',
  },
  graphqlEndpoint: '/',
  plugins: [
    useDisableIntrospection({
      isDisabled: process.env.NODE_ENV==="production"
    })
  ],
});

if(process.env.NODE_ENV==="production")
{
  console.log(process.env.NODE_ENV);
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../frontend", "build")));
  app.get("/*", function(req, res) {
    console.log("request page");
    res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
  });
}

app.use('/', yoga);

const httpServer = createServer(app)
const wsServer = new WebSocketServer({
  server: httpServer,
  path: yoga.graphqlEndpoint,
})

useServer(
  {
    execute: (args) => args.rootValue.execute(args),
    subscribe: (args) => args.rootValue.subscribe(args),
    onSubscribe: async (ctx, msg) => {
      const { schema, execute, subscribe, contextFactory, parse, validate } =
        yoga.getEnveloped({
          ...ctx,
          req: ctx.extra.request,
          socket: ctx.extra.socket,
          params: msg.payload
        })
      const args = {
        schema,
        operationName: msg.payload.operationName,
        document: parse(msg.payload.query),
        variableValues: msg.payload.variables,
        contextValue: await contextFactory(),
        rootValue: {
          execute,
          subscribe
        }
      }
      const errors = validate(args.schema, args.document)
      if (errors.length) return errors
      return args
    },
  },
  wsServer,
)
export default httpServer;