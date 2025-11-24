import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

/**
 * Validates that a field value belongs to a specific enum set when another field has a specific value
 * Useful for type-dependent enum validation
 *
 * @example
 * export class CreateLotDto {
 *   @IsEnumDependent('type', 'treatment', ['antibiotic', 'hormone', 'vaccine'])
 *   validateProductType?: boolean;
 *
 *   type: 'treatment' | 'slaughter' | 'sale';
 *   productType?: 'antibiotic' | 'hormone' | 'vaccine';  // Only valid if type='treatment'
 * }
 */
@ValidatorConstraint({ name: 'isEnumDependent', async: false })
export class IsEnumDependentConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const [dependentField, dependentValue, allowedValues] =
      args.constraints;
    const object = args.object as any;

    // If condition doesn't apply (dependent field doesn't match), validation passes
    if (object[dependentField] !== dependentValue) {
      return true;
    }

    // If condition applies, value must be in allowed set
    // If value is null/undefined, that's ok (might not be required for this path)
    if (value == null) {
      return true;
    }

    return (allowedValues as any[]).includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const [dependentField, dependentValue, allowedValues] =
      args.constraints;
    return `When ${dependentField} is "${dependentValue}", this field must be one of: ${(allowedValues as any[]).join(', ')}`;
  }
}

/**
 * Decorator for enum-dependent validation
 * @param dependentField Field that determines enum validation
 * @param dependentValue Value of dependent field that triggers validation
 * @param allowedValues Array of allowed enum values
 * @param validationOptions NestJS validation options
 */
export function IsEnumDependent(
  dependentField: string,
  dependentValue: any,
  allowedValues: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [dependentField, dependentValue, allowedValues],
      validator: IsEnumDependentConstraint,
    });
  };
}
