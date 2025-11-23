import { IsUUID, IsOptional, IsInt, IsBoolean, ValidateIf, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Décorateur personnalisé pour valider la contrainte XOR
function IsXorValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isXorValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as CreateFarmProductPreferenceDto;
          const hasGlobal = !!obj.globalProductId;
          const hasCustom = !!obj.customProductId;
          // XOR : exactement un des deux doit être vrai
          return (hasGlobal && !hasCustom) || (!hasGlobal && hasCustom);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Either globalProductId or customProductId must be provided, but not both';
        },
      },
    });
  };
}

export class CreateFarmProductPreferenceDto {
  @ApiPropertyOptional({
    description: 'Global product ID (from global catalog)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.customProductId)
  globalProductId?: string;

  @ApiPropertyOptional({
    description: 'Custom product ID (farm-specific)',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.globalProductId)
  customProductId?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    example: 1,
    default: 0
  })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is this preference active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Validation XOR personnalisée
  @IsXorValid({
    message: 'Either globalProductId or customProductId must be provided, but not both',
  })
  _xorValidation?: any;
}
