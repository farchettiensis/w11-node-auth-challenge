import { join } from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import FastifyView from '@fastify/view';
import EJS from 'ejs';
import { router } from './router.js';
import { fastifyCookie } from '@fastify/cookie';
import { fastifySession } from '@fastify/session';
import { fastifyFormbody } from '@fastify/formbody';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const makeServer = () => {
  const server = Fastify();

  server.register(FastifyView, {
    engine: {
      ejs: EJS,
    },
    includeViewExtension: true,
    root: join(__dirname, 'views'),
    layout: 'layouts/layout.ejs',
  });

  server.register(fastifyCookie);
  server.register(fastifySession, { secret: '69DB95EA161AC342B1AC7D45EAB22456', cookie: { secure: false } });
  server.register(fastifyFormbody);

  server.register(router);

  return server;
};

export { makeServer };
