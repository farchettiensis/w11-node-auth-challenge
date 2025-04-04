import { z } from 'zod';
import { UserRole } from '../../infrastructure/database/models/UserModel.js';

export const CreateUserSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().nonempty(),
    role: z.nativeEnum(UserRole),
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

export const UpdateUserSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email().nonempty(),
    role: z.nativeEnum(UserRole),
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
