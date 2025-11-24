import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

/**
 * Validates that if motherId is provided, the animal must be female
 * This is logically inconsistent: an animal can't be its own mother,
 * but since motherId references another animal, we're ensuring sex consistency
 */
@ValidatorConstraint({ name: 'isMotherMustBeFemale', async: false })
export class MotherMustBeFemaleConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as any;
    const motherId = object.motherId;

    // If no motherId, validation passes
    if (!motherId) {
      return true;
    }

    // If motherId is provided, sex MUST be 'female'
    // (You can't have a mother if you're male)
    return object.sex === 'female';
  }

  defaultMessage(args: ValidationArguments): string {
    return 'An animal with a motherId must have sex="female" (males cannot have mothers in breeding logic)';
  }
}

/**
 * Decorator for mother validation
 * @param validationOptions NestJS validation options
 */
export function IsMotherMustBeFemale(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MotherMustBeFemaleConstraint,
    });
  };
}
