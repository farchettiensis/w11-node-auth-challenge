import { join } from 'path';
import { fileURLToPath } from 'url';
import { fastifyCookie } from '@fastify/cookie';
import { fastifyFormbody } from '@fastify/formbody';
import { fastifySession } from '@fastify/session';
import FastifyView from '@fastify/view';
import EJS from 'ejs';
import Fastify, { type FastifyReply } from 'fastify';
import type { UserSchema } from '../../infrastructure/database/models/UserModel.js';
import { authPlugin } from './authPlugin.js';
import { router } from './router.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

declare module 'fastify' {
  interface FastifyReply {
    locals: {
      currentUser: UserSchema | null;
      flash: { [k: string]: undefined | string[] };
    };
  }

  interface FastifyRequest {
    currentUser?: UserSchema | null;
  }
}

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

  server.addHook('preHandler', (request, reply, done) => {
    reply.locals = reply.locals || {};
    reply.locals.flash = (reply.flash() ||
      {}) as FastifyReply['locals']['flash'];
    done();
  });

  server.register(fastifyCookie);
  server.register(fastifySession, {
    secret: '69DB95EA161AC342B1AC7D45EAB22456',
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  });
  server.register(fastifyFormbody);

  server.register(authPlugin);
  server.register(router);

  return server;
};

export { makeServer };
