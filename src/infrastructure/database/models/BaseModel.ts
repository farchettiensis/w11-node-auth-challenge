import AJVFormats from 'ajv-formats';
import { AjvValidator, Model } from 'objection';

const addFormats = AJVFormats.default;

abstract class BaseModel extends Model {
  createdAt!: string;
  updatedAt!: string;

  static createValidator(): AjvValidator {
    return new AjvValidator({
      onCreateAjv: (ajv) => {
        addFormats(ajv);
      },
      options: {
        allErrors: true,
        validateSchema: false,
        ownProperties: true,
      },
    });
  }

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}

export { BaseModel };
