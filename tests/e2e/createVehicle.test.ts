import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DealershipFactory } from '../../src/factories/dealershipFactory.js';
import { UserFactory } from '../../src/factories/userFactory.js';
import {
  type UserModel,
  UserRole,
} from '../../src/infrastructure/database/models/UserModel.js';
import { VehicleModel } from '../../src/infrastructure/database/models/VehicleModel.js';
import { type EndToEndTest, setupEndToEndTest } from '../setupEndToEndTest.js';

describe('Vehicles E2E', () => {
  let endToEnd: EndToEndTest;

  beforeAll(async () => {
    endToEnd = await setupEndToEndTest();
  });

  beforeEach(async () => {
    await endToEnd.cleanDatabase();
  });

  afterAll(async () => {
    await endToEnd.tearDown();
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

      cookieHeader = await endToEnd.authenticate({
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
        dealershipId: 9999,
      };

      const response = await fetch(`${endToEnd.baseUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: cookieHeader,
        },
        body: JSON.stringify(payload),
      });
      expect(response.status).toBe(200);

      const vehicles = await VehicleModel.query();

      expect(vehicles).toHaveLength(1);
      expect(vehicles[0].dealershipId).toBe(currentUser.dealershipId);
    });
  });
});
