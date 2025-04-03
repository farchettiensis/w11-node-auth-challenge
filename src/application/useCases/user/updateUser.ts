import { Result } from '../../../_lib/result.js';
import {
  ApplicationError,
  ErrorCodes,
} from '../../../errors/applicationError.js';
import type { UserModel } from '../../../infrastructure/database/models/UserModel.js';
import { UserRepository } from '../../../infrastructure/database/repositories/userRepository.js';
import type { UpdateUserDTO } from '../../dtos/userDTOs.js';

export const updateUser = async (
  id: number,
  input: UpdateUserDTO,
): Promise<Result<UserModel>> => {
  const findResult = await UserRepository.findById(id);

  if (!findResult.success) {
    return findResult;
  }

  const user = findResult.data;

  if (!user) {
    return Result.fail(
      new ApplicationError(ErrorCodes.NOT_FOUND, 'User not found'),
    );
  }

  const { name, email, role, dealershipId } = input;

  const emailResult = await UserRepository.findByEmail(email);

  if (emailResult.success && emailResult.data) {
    const existingUser = emailResult.data;

    if (existingUser.id !== id) {
      return Result.fail(
        new ApplicationError(ErrorCodes.INVALID, 'Email already in use'),
      );
    }
  }

  const updatedUser = user.$set({
    name,
    email,
    role,
    dealershipId,
  });

  return await UserRepository.update(id, updatedUser);
};
