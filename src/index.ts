import { config } from './config.js';
import { makeDatabase } from './infrastructure/database/database.js';
import { makeServer } from './interface/http/server.js';

const database = makeDatabase();

database
  .connect()
  .then(async () => {
    const server = makeServer();

    const address = await server.listen({ port: config.http[config.env].port });

    console.log(`Webserver listening at: ${address}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
