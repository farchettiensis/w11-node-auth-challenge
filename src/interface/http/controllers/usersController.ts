import { z } from 'zod';
import { handler } from '../../../_lib/http/handler.js';
import { UserModel } from '../../../infrastructure/database/models/UserModel.js';

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

const CreateUserSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().nonempty(),
    role: z.enum(['ADMIN', 'DEALERSHIP']),
    dealershipId: z.string().optional(),
  })
  .transform((data) => {
    let dealershipId = undefined;
    if (data.dealershipId && data.dealershipId.trim() !== '') {
      dealershipId = Number.parseInt(data.dealershipId, 10) || undefined;
    }

    return { ...data, dealershipId };
  })
  .refine(
    (data) =>
      data.role === 'ADMIN' ||
      (data.dealershipId && !Number.isNaN(data.dealershipId)),
    {
      message: 'A dealership user must have a valid dealershipId.',
      path: ['dealershipId'],
    },
  );

const UpdateUserSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email().nonempty(),
    role: z.enum(['ADMIN', 'DEALERSHIP']),
    dealershipId: z.string().optional(),
  })
  .transform((data) => {
    let dealershipId = undefined;
    if (data.dealershipId && data.dealershipId.trim() !== '') {
      dealershipId = Number.parseInt(data.dealershipId, 10) || undefined;
    }
    return { ...data, dealershipId };
  })
  .refine(
    (data) =>
      data.role === 'ADMIN' ||
      (data.dealershipId && !Number.isNaN(data.dealershipId)),
    {
      message: 'A dealership user must have a valid dealershipId.',
      path: ['dealershipId'],
    },
  );
