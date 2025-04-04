import type { Result } from '../../../_lib/result.js';
import type { UserModel } from '../../../infrastructure/database/models/UserModel.js';
import { UserRepository } from '../../../infrastructure/database/repositories/userRepository.js';

export const findUser = async (id: number): Promise<Result<UserModel>> => {
  return await UserRepository.findById(id);
};
