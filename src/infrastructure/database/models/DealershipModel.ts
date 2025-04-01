import type { JSONSchema, ModelObject } from 'objection';
import { BaseModel } from './BaseModel.js';

class DealershipModel extends BaseModel {
  static tableName = 'dealerships';

  id!: number;
  name!: string;

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['name'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
    },
  };
}

export { DealershipModel };
export type DealershipSchema = ModelObject<DealershipModel>;
