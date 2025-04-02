import { clean } from 'knex-cleaner';
import { makeDatabase } from '../src/infrastructure/database/database.js';
import { makeServer } from '../src/interface/http/server.js';

export const setupHttpTest = async () => {
  const server = await makeServer();
  const database = makeDatabase();

  await database.connect({ log: false });

  return {
    server,
    cleanDatabase: () => clean(database.knex),
    tearDown: () => database.disconnect({ log: false }),
  };
};

export type HttpTest = Awaited<ReturnType<typeof setupHttpTest>>;
