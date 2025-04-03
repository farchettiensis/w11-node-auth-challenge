import { faker } from '@faker-js/faker';
import type { QueryBuilder } from 'objection';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { DatabaseError } from '../../../../src/errors/databaseError.js';
import { ErrorCodes } from '../../../../src/errors/errorCodes.js';
import { DealershipFactory } from '../../../../src/factories/dealershipFactory.js';
import { UserFactory } from '../../../../src/factories/userFactory.js';
import {
  UserModel,
  UserRole,
} from '../../../../src/infrastructure/database/models/UserModel.js';
import { UserRepository } from '../../../../src/infrastructure/database/repositories/userRepository.js';
import {
  type IntegrationTest,
  setupIntegrationTest,
} from '../../../setupIntegrationTest.js';

describe('UserRepository', () => {
  let integrationTest: IntegrationTest;

  beforeAll(async () => {
    integrationTest = await setupIntegrationTest();
  });

  beforeEach(async () => {
    vi.restoreAllMocks();
    await integrationTest.cleanDatabase();
  });

  afterAll(async () => {
    await integrationTest.tearDown();
  });

  describe('UserRepository.create', () => {
    describe('when creation is successful', () => {
      it('returns a success result with the created user including dealership relation', async () => {
        const dealership = await DealershipFactory.create();

        const user = UserModel.fromJson(
          UserFactory.build({
            dealership,
            dealershipId: dealership.id,
          }),
        );

        const result = await UserRepository.create(user);

        expect(result).toMatchObject({
          success: true,
          data: user,
        });
      });
    });

    describe('when a database error occurs', () => {
      it('returns a database error failure', async () => {
        vi.spyOn(UserModel, 'query').mockReturnValue({
          insertAndFetch: vi.fn().mockReturnValue({
            withGraphFetched: vi
              .fn()
              .mockRejectedValue(new Error('Database error')),
          }),
        } as unknown as QueryBuilder<UserModel>);

        const dummyDealership = DealershipFactory.build();
        const dummyUser = UserModel.fromJson(
          UserFactory.build({
            role: UserRole.DEALERSHIP,
            dealership: dummyDealership,
            dealershipId: dummyDealership.id,
          }),
        );

        const result = await UserRepository.create(dummyUser);

        expect(result).toMatchObject({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Database error' },
        });
      });
    });
  });

  describe('UserRepository.update', () => {
    describe('when the update is successful', () => {
      it('returns a success result with the updated user including dealership relation', async () => {
        const dealership = await DealershipFactory.create();
        const user = UserModel.fromJson(
          UserFactory.build({
            dealership,
            dealershipId: dealership.id,
          }),
        );

        const createResult = await UserRepository.create(user);
        if (!createResult.success) {
          throw new Error('User creation failed in test setup.');
        }

        const updatedUser = createResult.data.$set({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          role: createResult.data.role,
          dealershipId: createResult.data.dealershipId,
        });

        const updateResult = await UserRepository.update(
          createResult.data.id,
          updatedUser,
        );

        expect(updateResult).toMatchObject({
          success: true,
          data: {
            id: createResult.data.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            dealershipId: updatedUser.dealershipId,
            dealership: expect.any(Object),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });
    });

    describe('when a database error occurs during update', () => {
      it('returns a database error failure', async () => {
        vi.spyOn(UserModel, 'query').mockReturnValue({
          patchAndFetchById: vi.fn().mockReturnValue({
            withGraphFetched: vi
              .fn()
              .mockRejectedValue(new Error('Database error')),
          }),
        } as unknown as QueryBuilder<UserModel>);

        const dummyDealership = DealershipFactory.build();
        const dummyUser = UserModel.fromJson(
          UserFactory.build({
            role: UserRole.DEALERSHIP,
            dealership: dummyDealership,
            dealershipId: dummyDealership.id,
          }),
        );

        const updateResult = await UserRepository.update(1, dummyUser);

        expect(updateResult).toMatchObject({
          success: false,
          error: { code: ErrorCodes.DATABASE_ERROR, message: 'Database error' },
        });
      });
    });
  });

  describe('UserRepository.findById', () => {
    describe('when the user exists and is a dealership', () => {
      it('returns the user with the relations', async () => {
        const dealership = await DealershipFactory.create();

        const user = await UserFactory.create({
          role: UserRole.DEALERSHIP,
          dealership,
        });

        const result = await UserRepository.findById(user.id);

        expect(result).toMatchObject({
          success: true,
          data: user,
        });
      });
    });

    describe('when the user exists and is an admin', () => {
      it('returns the user', async () => {
        const user = await UserFactory.create({
          role: UserRole.ADMIN,
        });

        const result = await UserRepository.findById(user.id);

        expect(result).toMatchObject({
          success: true,
          data: user,
        });
      });
    });

    describe('when the user does not exist', () => {
      it('returns undefined', async () => {
        const result = await UserRepository.findById(999);

        expect(result).toMatchObject({
          success: true,
          data: undefined,
        });
      });
    });

    describe('when a database error occurs', () => {
      it('returns a database error failure', async () => {
        vi.spyOn(UserModel, 'query').mockReturnValue({
          findById: vi.fn().mockReturnValue({
            withGraphFetched: vi
              .fn()
              .mockRejectedValue(new Error('Database error')),
          }),
        } as unknown as QueryBuilder<UserModel>);

        const result = await UserRepository.findById(1);

        expect(result).toMatchObject({
          success: false,
          error: { code: ErrorCodes.DATABASE_ERROR, message: 'Database error' },
        });
      });
    });
  });

  describe('UserRepository.findByEmail', () => {
    describe('when the user exists and is a dealership', () => {
      it('returns the user with the relations', async () => {
        const dealership = await DealershipFactory.create();
        const user = await UserFactory.create({
          role: UserRole.DEALERSHIP,
          dealership,
        });

        const result = await UserRepository.findByEmail(user.email);

        expect(result).toMatchObject({
          success: true,
          data: user,
        });
      });
    });

    describe('when the user exists and is an admin', () => {
      it('returns the user', async () => {
        const user = await UserFactory.create({
          role: UserRole.ADMIN,
        });

        const result = await UserRepository.findByEmail(user.email);

        expect(result).toMatchObject({
          success: true,
          data: user,
        });
      });
    });

    describe('when the user does not exist', () => {
      it('returns undefined', async () => {
        const nonExistentEmail = 'nonexistent@example.com';
        const result = await UserRepository.findByEmail(nonExistentEmail);

        expect(result).toMatchObject({
          success: true,
          data: undefined,
        });
      });
    });

    describe('when a database error occurs', () => {
      it('returns a database error failure', async () => {
        vi.spyOn(UserModel, 'query').mockReturnValue({
          findOne: vi.fn().mockReturnValue({
            withGraphFetched: vi
              .fn()
              .mockRejectedValue(new Error('Database error')),
          }),
        } as unknown as QueryBuilder<UserModel>);

        const result = await UserRepository.findByEmail('any@example.com');

        expect(result).toMatchObject({
          success: false,
          error: { code: ErrorCodes.DATABASE_ERROR, message: 'Database error' },
        });
      });
    });
  });

  describe('UserRepository.findAll', () => {
    describe('when users exist', () => {
      it('returns an array of users', async () => {
        const user1 = await UserFactory.create();
        const user2 = await UserFactory.create();

        const result = await UserRepository.findAll();
        if (!result.success) {
          throw new Error('Find operation failed in test setup.');
        }

        expect(result.success).toBe(true);
        expect(Array.isArray(result.data)).toBe(true);

        expect(result.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: user1.id }),
            expect.objectContaining({ id: user2.id }),
          ]),
        );
      });
    });

    describe('when no users exist', () => {
      it('returns an empty array', async () => {
        const result = await UserRepository.findAll();

        expect(result).toMatchObject({
          success: true,
          data: expect.arrayContaining([]),
        });
      });
    });

    describe('when a database error occurs', () => {
      it('returns a database error failure', async () => {
        vi.spyOn(UserModel, 'query').mockRejectedValue(
          new DatabaseError(ErrorCodes.DATABASE_ERROR, 'Database error'),
        );

        const result = await UserRepository.findAll();

        expect(result).toMatchObject({
          success: false,
          error: { code: ErrorCodes.DATABASE_ERROR, message: 'Database error' },
        });
      });
    });
  });
});
