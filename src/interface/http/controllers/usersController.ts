import { handler } from '../../../_lib/http/handler.js';
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

  try {
    await UserModel.query().insert({
      name,
      email,
      password,
      role,
      dealershipId,
    } as Partial<UserModel>);

    return reply.redirect('/users');
  } catch (error) {
    console.log(error);
    return reply.view('users/create', {
      user: new UserModel().$set({
        name,
        email,
        role,
        dealershipId,
      }),
    });
  }
});

const update = handler<{ Params: { id: string } }>(async (request, reply) => {
  const user = await UserModel.query()
    .findById(request.params.id)
    .throwIfNotFound();

  const parseResult = UpdateUserSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.view('users/update', {
      user: request.body,
    });
  }

  const { name, email, role, dealershipId } = parseResult.data;

  const newUser = user.$set({
    name,
    email,
    role,
    dealershipId,
  });

  try {
    await newUser.$query().update();

    return reply.redirect('/users');
  } catch (error) {
    console.error(error);
    return reply.view('users/update', { user: newUser });
  }
});

const edit = handler<{ Params: { id: string } }>(async (request, reply) => {
  const user = await UserModel.query()
    .findById(request.params.id)
    .throwIfNotFound();

  return reply.view('users/update', { user });
});

export { index, create, store, edit, update };
