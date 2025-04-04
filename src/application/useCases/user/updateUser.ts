import type { Result } from '../../../_lib/result.js';
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

  const { name, email, role, dealershipId } = input;

  const updatedUser = user.$set({
    name,
    email,
    role,
    dealershipId,
  });

  return await UserRepository.update(id, updatedUser);
};
