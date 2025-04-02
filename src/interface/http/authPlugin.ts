import { Authenticator } from '@fastify/passport';
import type { FastifyPluginAsync } from 'fastify';
import plugin from 'fastify-plugin';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserModel } from '../../infrastructure/database/models/UserModel.js';
import * as AuthController from './controllers/authController.js';

declare module 'fastify' {
  interface PassportUser extends UserModel {}
}

const authPlugin: FastifyPluginAsync = plugin(async (server) => {
  const authenticator = new Authenticator();

  server.register(authenticator.initialize());
  server.register(authenticator.secureSession());

  server.addHook('preHandler', (request, reply, done) => {
    reply.locals = reply.locals || {};
    reply.locals.currentUser = request.user ?? null;
    done();
  });

  authenticator.use(
    'local',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const maybeUser = await UserModel.authenticate({ email, password });
          if (!maybeUser) {
            return done(null, false);
          }
          return done(null, maybeUser);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  authenticator.registerUserSerializer<UserModel, number>(
    async (user) => user.id,
  );

  authenticator.registerUserDeserializer<number, UserModel>(async (id) => {
    return UserModel.query().findById(id).throwIfNotFound();
  });

  server.get('/signout', AuthController.logout);
  server.get('/signin', AuthController.login);
  server.post(
    '/signin',
    authenticator.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/signin',
    }),
  );
});

export { authPlugin };
