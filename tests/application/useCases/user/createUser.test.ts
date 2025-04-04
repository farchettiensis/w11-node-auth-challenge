import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createUser } from '../../../../src/application/useCases/user/createUser.js';
import { ErrorCodes } from '../../../../src/errors/errorCodes.js';
import { DealershipFactory } from '../../../../src/factories/dealershipFactory.js';
import { UserRole } from '../../../../src/infrastructure/database/models/UserModel.js';
import {
  type IntegrationTest,
  setupIntegrationTest,
} from '../../../setupIntegrationTest.js';

describe('createUser', () => {
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
    describe('and the user is a dealership', () => {
      it('creates a new dealership user', async () => {
        const dealership = await DealershipFactory.create();

        const userData = {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          role: UserRole.DEALERSHIP,
          dealershipId: dealership.id,
        };

        const result = await createUser(userData);

        expect(result).toMatchObject({
          success: true,
          data: {
            id: expect.any(Number),
            name: userData.name,
            email: userData.email,
            encryptedPassword: expect.any(String),
            role: userData.role,
            dealershipId: userData.dealershipId,
            dealership,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });
    });

    describe('and the user is an admin', () => {
      it('creates a new admin user', async () => {
        const userData = {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          role: UserRole.ADMIN,
        };

        const result = await createUser(userData);

        expect(result).toMatchObject({
          success: true,
          data: {
            id: expect.any(Number),
            name: userData.name,
            email: userData.email,
            encryptedPassword: expect.any(String),
            role: userData.role,
            dealershipId: null,
            dealership: null,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });
    });
  });

  describe('when the email is already in use', () => {
    it('returns a database error', async () => {
      const dealership = await DealershipFactory.create();

      const email = faker.internet.email();

      const userData = {
        name: faker.person.fullName(),
        email,
        password: faker.internet.password(),
        role: UserRole.DEALERSHIP,
        dealershipId: dealership.id,
      };

      const firstResult = await createUser(userData);
      expect(firstResult.success).toBe(true);

      const duplicateResult = await createUser(userData);
      expect(duplicateResult).toMatchObject({
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
        },
      });
    });
  });

  describe('when dealershipId is not provided for a dealership user', () => {
    it('fails to create a new dealership user', async () => {
      const userData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRole.DEALERSHIP,
      };

      const result = await createUser(userData);

      expect(result).toMatchObject({
        success: false,
        error: {
          code: ErrorCodes.INVALID,
          message: expect.stringContaining('dealershipId'),
        },
      });
    });
  });
});
