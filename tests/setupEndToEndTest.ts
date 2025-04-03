import { clean } from 'knex-cleaner';
import { config } from '../src/config.js';
import { makeDatabase } from '../src/infrastructure/database/database.js';
import { makeServer } from '../src/interface/http/server.js';

export const setupEndToEndTest = async () => {
  const server = await makeServer();
  const database = makeDatabase();

  await database.connect();

  return {
    baseUrl: `http://localhost:${config.http[config.env].port}`,
    cleanDatabase: () => clean(database.knex),
    tearDown: () => database.disconnect({ log: false }),
    authenticate: async (input: {
      email: string;
      password: string;
    }): Promise<string> => {
      const response = await server.inject({
        method: 'POST',
        url: '/signin',
        payload: input,
      });

      const setCookie = response.headers['set-cookie'];
      if (!setCookie) {
        throw new Error('Authentication failed: no set-cookie header returned');
      }
      if (Array.isArray(setCookie)) {
        return setCookie[0];
      }
      return setCookie;
    },
  };
};

export type EndToEndTest = Awaited<ReturnType<typeof setupEndToEndTest>>;
