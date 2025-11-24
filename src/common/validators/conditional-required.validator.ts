import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

/**
 * Validates that a field is required when another field has a specific value
 * Useful for conditional requirements based on field values
 *
 * @example
 * export class CreateBreedingDto {
 *   @IsConditionalRequired('method', 'artificial', 'semenSource')
 *   validateConditional?: boolean;
 *
 *   method: 'natural' | 'artificial';
 *   semenSource?: string;  // Required only if method='artificial'
 * }
 */
@ValidatorConstraint({ name: 'isConditionalRequired', async: false })
export class ConditionalRequiredConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const [dependentField, dependentValue, requiredField] =
      args.constraints;
    const object = args.object as any;

    // If dependent field has the specific value, required field must be provided
    if (object[dependentField] === dependentValue) {
      return object[requiredField] != null;
    }

    // If condition doesn't apply, validation passes
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const [dependentField, dependentValue, requiredField] =
      args.constraints;
    return `${requiredField} is required when ${dependentField} is "${dependentValue}"`;
  }
}

/**
 * Decorator for conditional required validation
 * @param dependentField Field that determines if validation applies
 * @param dependentValue Value of dependent field that triggers requirement
 * @param requiredField Field that becomes required
 * @param validationOptions NestJS validation options
 */
export function IsConditionalRequired(
  dependentField: string,
  dependentValue: any,
  requiredField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [dependentField, dependentValue, requiredField],
      validator: ConditionalRequiredConstraint,
    });
  };
}
