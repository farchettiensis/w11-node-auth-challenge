import type { preValidationAsyncHookHandler } from 'fastify';

export const authValidation: preValidationAsyncHookHandler = async (
  request,
  reply,
) => {
  if (!request?.isAuthenticated()) {
    return reply.redirect('/signin');
  }
};
