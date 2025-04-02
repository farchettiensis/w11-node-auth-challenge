import { handler } from '../../../_lib/http/handler.js';

const login = handler(async (_request, reply) => {
  return reply.view('auth/login');
});

const logout = handler(async (request, reply) => {
  await request.logout();
  return reply.redirect('/');
});

export { login, logout };
