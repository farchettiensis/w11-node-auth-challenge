import type { Result } from '../../../_lib/result.js';
import type { UserModel } from '../../../infrastructure/database/models/UserModel.js';
import { UserRepository } from '../../../infrastructure/database/repositories/userRepository.js';

export const findUsers = async (): Promise<Result<UserModel[]>> => {
  return await UserRepository.findAll();
};
