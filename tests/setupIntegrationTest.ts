import { clean } from 'knex-cleaner';
import { makeDatabase } from '../src/infrastructure/database/database.js';

export const setupIntegrationTest = async () => {
  const database = makeDatabase();

  await database.connect({ log: false });

  return {
    cleanDatabase: () => clean(database.knex),
    tearDown: () => database.disconnect({ log: false }),
  };
};

export type IntegrationTest = Awaited<ReturnType<typeof setupIntegrationTest>>;
