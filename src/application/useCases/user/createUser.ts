import { Result } from '../../../_lib/result.js';
import {
  ApplicationError,
  ErrorCodes,
} from '../../../errors/applicationError.js';
import { UserModel } from '../../../infrastructure/database/models/UserModel.js';
import { UserRepository } from '../../../infrastructure/database/repositories/userRepository.js';
import type { CreateUserDTO } from '../../dtos/userDTOs.js';

export const createUser = async (
  input: CreateUserDTO,
): Promise<Result<UserModel>> => {
  const { name, email, password, role, dealershipId } = input;

  const findResult = await UserRepository.findByEmail(email);

  if (!findResult.success) {
    return findResult;
  }

  const existingUser = findResult.data;

  if (existingUser) {
    return Result.fail(
      new ApplicationError(ErrorCodes.INVALID, 'Email already in use'),
    );
  }

  const user = UserModel.fromJson({
    name,
    email,
    password,
    role,
    dealershipId,
  });

  return await UserRepository.create(user);
};
