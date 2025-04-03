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
    authenticate: async (input: {
      email: string;
      password: string;
    }): Promise<string> => {
      const response = await server.inject({
        method: 'POST',
        url: '/signin',
        payload: input,
      });

      if (!response.cookies || response.cookies.length === 0) {
        throw new Error('Authentication failed: no cookies returned');
      }

      const cookieObj = response.cookies[0];
      const cookieHeader = `${cookieObj.name}=${cookieObj.value}`;

      return cookieHeader;
    },
  };
};

export type HttpTest = Awaited<ReturnType<typeof setupHttpTest>>;
