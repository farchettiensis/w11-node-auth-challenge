import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DealershipFactory } from '../../../../src/factories/dealershipFactory.js';
import { UserFactory } from '../../../../src/factories/userFactory.js';
import {
  type UserModel,
  UserRole,
} from '../../../../src/infrastructure/database/models/UserModel.js';
import { VehicleModel } from '../../../../src/infrastructure/database/models/VehicleModel.js';
import { type HttpTest, setupHttpTest } from '../../../setupHttpTest.js';

describe('POST /vehicles', () => {
  let httpTest: HttpTest;

  beforeAll(async () => {
    httpTest = await setupHttpTest();
  });

  beforeEach(async () => {
    await httpTest.cleanDatabase();
  });

  afterAll(async () => {
    await httpTest.tearDown();
  });

  describe('when authenticated as a dealership user', () => {
    let cookieHeader: string;
    let currentUser: UserModel;

    beforeEach(async () => {
      const dealership = await DealershipFactory.create();
      const password = faker.internet.password();

      currentUser = await UserFactory.create({
        role: UserRole.DEALERSHIP,
        password,
        dealershipId: dealership.id,
      });

      cookieHeader = await httpTest.authenticate({
        email: currentUser.email,
        password,
      });
    });

    it('creates a new vehicle', async () => {
      const payload = {
        name: faker.vehicle.vehicle(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: String(
          faker.number.int({ min: 1886, max: new Date().getFullYear() }),
        ),
        comments: faker.lorem.sentence(),
      };

      const createVehicleResponse = await httpTest.server.inject({
        method: 'POST',
        url: '/vehicles',
        payload,
        headers: {
          cookie: cookieHeader,
        },
      });
      expect(createVehicleResponse.statusCode).toBe(302);

      const vehicles = await VehicleModel.query();
      expect(vehicles).toHaveLength(1);
      expect(vehicles[0]).toMatchObject({
        name: payload.name,
        brand: payload.brand,
        model: payload.model,
        year: payload.year,
        comments: payload.comments,
        dealershipId: currentUser.dealershipId,
      });
    });
  });
});
