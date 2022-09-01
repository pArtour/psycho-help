import { ApolloServer } from "apollo-server-express";
import * as Express from "express";
import { buildSchema, Query, Resolver } from "type-graphql";
import { Server } from "http";

@Resolver()
class HelloWorldResolver {
  @Query(() => String)
  async hello() {
    return "Hello world"
  }
}

const signals = ["SIGINT", "SIGTERM", "SIGHUP"] as const;

function gracegfulshutdown({signal, server}: {signal: typeof signals[number], server: Server}) {
  console.log(`Got signal: ${signal}`);
   server.close();
   process.exit(0);
}

async function main() {
  const schema = await buildSchema({
    resolvers: [HelloWorldResolver]
  })
  const apolloServer = new ApolloServer({
    schema,
  });

  const app = Express();

  apolloServer.applyMiddleware({app});
  const server = app.listen(process.env.PORT || 4000, () => {
    console.log("Server started on http://localhost:4000");
  });

  for (let i = 0; i < signals.length; i++) {
    process.on(signals[i], () => {
      gracegfulshutdown({signal: signals[i], server})
    })
  }
}

main();