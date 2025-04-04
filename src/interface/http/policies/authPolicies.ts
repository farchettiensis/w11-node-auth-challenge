import type { preValidationAsyncHookHandler } from 'fastify';

export const authValidation: preValidationAsyncHookHandler = async (
  request,
  reply,
) => {
  if (!request?.isAuthenticated()) {
    return reply.redirect('/signin');
  }
};

export const adminOnly: preValidationAsyncHookHandler = async (
  request,
  reply,
) => {
  const user = request.user;
  if (!user) {
    return reply.redirect('/signin');
  }

  if (!user.isAdmin()) {
    request.flash('alert', 'Not authorization to access this resource!');
    return reply.redirect('/');
  }
};

export const dealershipOnly: preValidationAsyncHookHandler = async (
  request,
  reply,
) => {
  const user = request.user;
  if (!user) {
    return reply.redirect('/signin');
  }
  if (!user.isDealership()) {
    request.flash('alert', 'Not authorization to access this resource!');
    return reply.redirect('/');
  }
};
