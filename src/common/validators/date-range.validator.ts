import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

/**
 * Validates that a date field is after or equal to another date field
 * Useful for date range validations (e.g., endDate >= startDate)
 *
 * @example
 * export class CreateTreatmentDto {
 *   @IsDateString()
 *   treatmentDate: string;
 *
 *   @IsDateAfterOrEqual('treatmentDate')
 *   withdrawalEndDate?: string;  // Must be >= treatmentDate
 * }
 */
@ValidatorConstraint({ name: 'isDateAfterOrEqual', async: false })
export class IsDateAfterOrEqualConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const [otherFieldName] = args.constraints;
    const object = args.object as any;
    const otherValue = object[otherFieldName];

    // If either field is null/undefined, skip validation
    if (!value || !otherValue) {
      return true;
    }

    try {
      const date1 = new Date(value);
      const date2 = new Date(otherValue);

      // Check if dates are valid
      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return false;
      }

      // value must be >= otherValue
      return date1.getTime() >= date2.getTime();
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [otherFieldName] = args.constraints;
    return `This date must be after or equal to ${otherFieldName}`;
  }
}

/**
 * Decorator for date range validation
 * @param otherFieldName The field to compare against
 * @param validationOptions NestJS validation options
 */
export function IsDateAfterOrEqual(
  otherFieldName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [otherFieldName],
      validator: IsDateAfterOrEqualConstraint,
    });
  };
}

/**
 * Validates that a date field is strictly after another date field
 * Useful for strict date range validations (e.g., expiryDate > vaccinationDate)
 */
@ValidatorConstraint({ name: 'isDateAfter', async: false })
export class IsDateAfterConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [otherFieldName] = args.constraints;
    const object = args.object as any;
    const otherValue = object[otherFieldName];

    // If either field is null/undefined, skip validation
    if (!value || !otherValue) {
      return true;
    }

    try {
      const date1 = new Date(value);
      const date2 = new Date(otherValue);

      // Check if dates are valid
      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return false;
      }

      // value must be > otherValue
      return date1.getTime() > date2.getTime();
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [otherFieldName] = args.constraints;
    return `This date must be strictly after ${otherFieldName}`;
  }
}

/**
 * Decorator for strict date range validation
 * @param otherFieldName The field to compare against
 * @param validationOptions NestJS validation options
 */
export function IsDateAfter(
  otherFieldName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [otherFieldName],
      validator: IsDateAfterConstraint,
    });
  };
}
