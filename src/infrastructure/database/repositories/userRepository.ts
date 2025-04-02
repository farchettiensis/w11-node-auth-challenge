import { Result } from '../../../_lib/result.js';
import { UserModel } from '../models/UserModel.js';

export const UserRepository = {
  async create(user: UserModel) {
    try {
      const createdUser = await UserModel.query()
        .insertAndFetch(user)
        .withGraphFetched('dealership');

      return Result.succeed(createdUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database error';

      return Result.fail<UserModel>({ code: 'DATABASE_ERROR', message });
    }
  },

  async update(id: number, user: UserModel) {
    try {
      const updatedUser = await UserModel.query()
        .patchAndFetchById(id, user)
        .withGraphFetched('dealership');

      return Result.succeed(updatedUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database error';

      return Result.fail<UserModel>({ code: 'DATABASE_ERROR', message });
    }
  },

  async findById(id: number) {
    try {
      const user = await UserModel.query().findById(id);

      return Result.succeed(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database error';

      return Result.fail<UserModel>({ code: 'DATABASE_ERROR', message });
    }
  },

  async findByEmail(email: string) {
    try {
      const user = await UserModel.query().findOne({ email });

      return Result.succeed(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database error';

      return Result.fail<UserModel>({ code: 'DATABASE_ERROR', message });
    }
  },

  async findAll() {
    try {
      const users = await UserModel.query();

      return Result.succeed(users);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database error';

      return Result.fail<UserModel[]>({ code: 'DATABASE_ERROR', message });
    }
  },
};
