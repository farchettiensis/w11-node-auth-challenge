import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createUser } from '../../../../src/application/useCases/user/createUser.js';
import { updateUser } from '../../../../src/application/useCases/user/updateUser.js';
import { ErrorCodes } from '../../../../src/errors/errorCodes.js';
import { DealershipFactory } from '../../../../src/factories/dealershipFactory.js';
import { UserRole } from '../../../../src/infrastructure/database/models/UserModel.js';
import {
  type IntegrationTest,
  setupIntegrationTest,
} from '../../../setupIntegrationTest.js';

describe('updateUser', () => {
  let integrationTest: IntegrationTest;

  beforeAll(async () => {
    integrationTest = await setupIntegrationTest();
  });

  beforeEach(async () => {
    await integrationTest.cleanDatabase();
  });

  afterAll(async () => {
    await integrationTest.tearDown();
  });

  describe('when the data is valid', () => {
    it('updates an existing user successfully', async () => {
      const dealership = await DealershipFactory.create();

      const userData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRole.DEALERSHIP,
        dealershipId: dealership.id,
      };

      const createResult = await createUser(userData);
      expect(createResult.success).toBe(true);
      if (!createResult.success) {
        throw new Error('User creation failed in test setup.');
      }

      const userId = createResult.data.id;

      const updatedData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: UserRole.ADMIN,
        dealershipId: null,
      };

      const updateResult = await updateUser(userId, updatedData);

      expect(updateResult).toMatchObject({
        success: true,
        data: {
          id: userId,
          name: updatedData.name,
          email: updatedData.email,
          role: updatedData.role,
          dealershipId: null,
          dealership: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('when the email is already in use by another user', () => {
    it('fails to update the user with duplicate email', async () => {
      const dealership = await DealershipFactory.create();

      const userData1 = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRole.DEALERSHIP,
        dealershipId: dealership.id,
      };

      const userData2 = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRole.DEALERSHIP,
        dealershipId: dealership.id,
      };

      const createResult1 = await createUser(userData1);
      expect(createResult1.success).toBe(true);

      const createResult2 = await createUser(userData2);
      expect(createResult2.success).toBe(true);
      if (!createResult2.success) {
        throw new Error('User creation failed in test setup.');
      }

      const updateResult = await updateUser(createResult2.data.id, {
        name: faker.person.fullName(),
        email: userData1.email,
        role: UserRole.DEALERSHIP,
        dealershipId: dealership.id,
      });

      expect(updateResult).toMatchObject({
        success: false,
        error: {
          code: ErrorCodes.INVALID,
          message: 'Email already in use',
        },
      });
    });
  });

  describe('when the user is not found', () => {
    it('fails with a NOT_FOUND error', async () => {
      const nonExistentUserId = 999999;

      const updateResult = await updateUser(nonExistentUserId, {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: UserRole.DEALERSHIP,
        dealershipId: 123,
      });

      expect(updateResult).toMatchObject({
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'User not found',
        },
      });
    });
  });
});
