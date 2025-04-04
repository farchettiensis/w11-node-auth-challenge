import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import type { ModelObject } from 'objection';
import { VehicleModel } from '../infrastructure/database/models/VehicleModel.js';
import { DealershipFactory } from './dealershipFactory.js';

export const VehicleFactory = Factory.define<
  ModelObject<VehicleModel>,
  never,
  VehicleModel
>(({ onCreate, sequence, params }) => {
  onCreate(async (vehicle) => {
    if (!params.dealershipId) {
      const dealership = await DealershipFactory.create();
      vehicle.dealershipId = dealership.id;
    }

    const createdVehicle = await VehicleModel.query()
      .insertAndFetch(vehicle)
      .withGraphFetched('dealership');

    return createdVehicle;
  });

  const dealership = DealershipFactory.build();

  const {
    brand = faker.vehicle.manufacturer(),
    name = faker.vehicle.vehicle(),
    model = faker.vehicle.model(),
    year = faker.string.numeric({ length: { min: 1886, max: 2025 } }),
    comments = faker.lorem.words(),
    dealershipId = DealershipFactory.build().id,
  } = params;

  return {
    id: sequence,
    brand,
    name,
    model,
    year,
    comments,
    dealershipId,
    dealership,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});
