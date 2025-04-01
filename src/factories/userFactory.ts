import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { Factory } from 'fishery';
import type { ModelObject } from 'objection';
import {
  UserModel,
  UserRole,
} from '../infrastructure/database/models/UserModel.js';
import { DealershipFactory } from './dealershipFactory.js';

export const UserFactory = Factory.define<
  ModelObject<UserModel>,
  never,
  UserModel
>(({ onCreate, sequence, params }) => {
  onCreate(async (user) => {
    if (user.role === UserRole.DEALERSHIP && !user.dealershipId) {
      const dealership = await DealershipFactory.create();
      user.dealershipId = dealership.id;
    }

    const createdUser = await UserModel.query()
      .insertAndFetch(user)
      .withGraphFetched('dealership');

    return createdUser;
  });

  const {
    name = faker.person.fullName(),
    email = faker.internet.email(),
    password = faker.internet.password(),
    role = UserRole.DEALERSHIP,
    dealershipId,
  } = params;

  return {
    id: sequence,
    name,
    email,
    role,
    password,
    encryptedPassword: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
    dealershipId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});
