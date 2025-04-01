import { handler } from '../../../_lib/http/handler.js';
import { createUser } from '../../../application/useCases/user/createUser.js';
import { updateUser } from '../../../application/useCases/user/updateUser.js';
import { UserModel } from '../../../infrastructure/database/models/UserModel.js';
import {
  CreateUserSchema,
  UpdateUserSchema,
} from '../../schemas/userSchemas.js';

const index = handler(async (_request, reply) => {
  const users = await UserModel.query();

  return reply.view('users/index', { users });
});

const create = handler(async (_request, reply) => {
  return reply.view('users/create', {
    user: new UserModel(),
  });
});

const store = handler(async (request, reply) => {
  const parseResult = CreateUserSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.view('users/create', {
      user: request.body,
    });
  }

  const { name, email, password, role, dealershipId } = parseResult.data;

  const result = await createUser({
    name,
    email,
    password,
    role,
    dealershipId,
  });

  if (!result.success) {
    console.error(result.error.message);

    return reply.view('users/create', {
      user: new UserModel().$set({
        name,
        email,
        role,
        dealershipId,
      }),
    });
  }

  return reply.redirect('/users');
});

const update = handler<{ Params: { id: string } }>(async (request, reply) => {
  const parseResult = UpdateUserSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.view('users/update', {
      user: request.body,
    });
  }

  const { name, email, role, dealershipId } = parseResult.data;

  const result = await updateUser(Number(request.params.id), {
    name,
    email,
    role,
    dealershipId,
  });

  if (!result.success) {
    console.error(result.error.message);

    return reply.view('users/update', {
      user: request.body,
    });
  }

  return reply.redirect('/users');
});

const edit = handler<{ Params: { id: string } }>(async (request, reply) => {
  const user = await UserModel.query()
    .findById(request.params.id)
    .throwIfNotFound();

  return reply.view('users/update', { user });
});

export { index, create, store, edit, update };
