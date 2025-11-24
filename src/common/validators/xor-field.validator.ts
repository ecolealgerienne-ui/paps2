import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

/**
 * Validates that exactly ONE of the specified fields is provided (XOR logic)
 * Useful for mutually exclusive fields (e.g., either globalProductId OR customProductId, not both)
 *
 * @example
 * export class CreateProductPreferenceDto {
 *   @IsXorField(['globalProductId', 'customProductId'])
 *   validateXor?: boolean;
 *
 *   globalProductId?: string;
 *   customProductId?: string;
 * }
 */
@ValidatorConstraint({ name: 'isXorField', async: false })
export class IsXorFieldConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [fields] = args.constraints;
    const object = args.object as any;

    // Count how many fields are provided (not null/undefined)
    const filledFields = fields.filter((field: string) => object[field] != null);

    // Exactly one must be filled
    return filledFields.length === 1;
  }

  defaultMessage(args: ValidationArguments): string {
    const [fields] = args.constraints;
    return `Exactly one of these fields must be provided: ${(fields as string[]).join(', ')}`;
  }
}

/**
 * Decorator for XOR field validation
 * @param fields Array of field names that should be mutually exclusive
 * @param validationOptions NestJS validation options
 */
export function IsXorField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: IsXorFieldConstraint,
    });
  };
}
