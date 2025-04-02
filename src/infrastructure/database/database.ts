import Knex from 'knex';
import { config } from '../../config.js';
import { BaseModel } from './models/BaseModel.js';

const makeDatabase = () => {
  const knex = Knex(config.db[config.env]);

  BaseModel.knex(knex);

  return {
    knex,

    async connect(config = { log: true }) {
      await knex.raw('SELECT 1');
      console.log('Database connected successfully.');
    },

    async disconnect(config = { log: true }) {
      await knex.destroy();
      console.log('Database disconnected successfully.');
    },
  };
};

export { makeDatabase };
