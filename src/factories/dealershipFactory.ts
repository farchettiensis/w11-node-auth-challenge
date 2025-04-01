import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import type { ModelObject } from 'objection';
import { DealershipModel } from '../infrastructure/database/models/DealershipModel.js';

const DealershipFactory = Factory.define<
  ModelObject<DealershipModel>,
  never,
  DealershipModel
>(({ onCreate, sequence, params }) => {
  onCreate(async (dealership) => {
    return await DealershipModel.query().insertAndFetch(dealership);
  });

  const { name = faker.company.name() } = params;

  return {
    id: sequence,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

export { DealershipFactory };
