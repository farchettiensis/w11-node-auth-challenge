import bcrypt from 'bcrypt';
import type {
  JSONSchema,
  ModelObject,
  ModelOptions,
  Pojo,
  RelationMappings,
} from 'objection';
import { BaseModel } from './BaseModel.js';
import { DealershipModel, type DealershipSchema } from './DealershipModel.js';

export enum UserRole {
  ADMIN = 'ADMIN',
  DEALERSHIP = 'DEALERSHIP',
}

export class UserModel extends BaseModel {
  static tableName = 'users';

  id!: number;
  email!: string;
  name!: string;
  password!: string;
  encryptedPassword!: string;
  role!: UserRole;

  dealershipId?: number;
  dealership?: DealershipSchema;

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['email', 'name', 'role'],
    properties: {
      id: { type: 'number' },
      email: { type: 'string' },
      name: { type: 'string' },
      password: { type: 'string' },
      role: { type: 'string', enum: Object.values(UserRole) },
    },
    if: {
      properties: {
        role: { const: 'DEALERSHIP' },
      },
    },
    // biome-ignore lint/suspicious/noThenProperty: <explanation>
    then: {
      required: ['dealershipId'],
    },
  };

  static get relationMappings(): RelationMappings {
    return {
      dealership: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: DealershipModel,
        join: {
          from: 'users.dealershipId',
          to: 'dealerships.id',
        },
      },
    };
  }

  $parseJson(json: Pojo, options?: ModelOptions | undefined): Pojo {
    const { password, ...actualJson } = json;

    const parsedJson = {
      ...super.$parseJson(actualJson, options),
      encryptedPassword: password
        ? bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        : null,
    };

    return parsedJson;
  }

  static async authenticate({ email, password }: AuthParams) {
    return UserModel.query()
      .findOne({ email })
      .then(async (user) => {
        const isPasswordValidated = Boolean(
          await user?.validatePassword(password),
        );

        if (!user || !isPasswordValidated) {
          return null;
        }

        return user;
      });
  }

  isAdmin() {
    return this.role === UserRole.ADMIN;
  }

  isDealership() {
    return this.role === UserRole.DEALERSHIP;
  }

  private validatePassword(password: string) {
    return bcrypt.compare(password, this.encryptedPassword);
  }
}

type AuthParams = {
  email: string;
  password: string;
};

export type UserSchema = ModelObject<UserModel>;
