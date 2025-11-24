import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { IsXorField } from '../xor-field.validator';
import { IsConditionalRequired } from '../conditional-required.validator';
import { IsDateAfter, IsDateAfterOrEqual } from '../date-range.validator';
import { IsEnumDependent } from '../enum-dependent.validator';

// ========================================
// Test Classes
// ========================================

class XorTestDto {
  @IsXorField(['fieldA', 'fieldB'])
  validateXor?: boolean;

  fieldA?: string;
  fieldB?: string;
}

class ConditionalRequiredTestDto {
  @IsConditionalRequired('status', 'temporary', 'destination')
  validateConditional?: boolean;

  status: 'temporary' | 'permanent';
  destination?: string;
}

class DateRangeTestDto {
  startDate: string;

  @IsDateAfterOrEqual('startDate')
  endDate?: string;
}

class EnumDependentTestDto {
  @IsEnumDependent('type', 'treatment', ['antibiotic', 'vaccine'])
  validateEnum?: boolean;

  type: 'treatment' | 'slaughter';
  productType?: string;
}

// ========================================
// XOR Field Validator Tests
// ========================================

describe('IsXorField Validator', () => {
  it('should pass when exactly one field is provided', async () => {
    const dto = plainToClass(XorTestDto, {
      fieldA: 'value-a',
      fieldB: undefined,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when exactly one field (fieldB) is provided', async () => {
    const dto = plainToClass(XorTestDto, {
      fieldA: undefined,
      fieldB: 'value-b',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when both fields are provided', async () => {
    const dto = plainToClass(XorTestDto, {
      fieldA: 'value-a',
      fieldB: 'value-b',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isXorField');
  });

  it('should fail when neither field is provided', async () => {
    const dto = plainToClass(XorTestDto, {
      fieldA: undefined,
      fieldB: undefined,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isXorField');
  });
});

// ========================================
// Conditional Required Validator Tests
// ========================================

describe('IsConditionalRequired Validator', () => {
  it('should pass when condition applies and field is provided', async () => {
    const dto = plainToClass(ConditionalRequiredTestDto, {
      status: 'temporary',
      destination: 'farm-123',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when condition applies and field is missing', async () => {
    const dto = plainToClass(ConditionalRequiredTestDto, {
      status: 'temporary',
      destination: undefined,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isConditionalRequired');
  });

  it('should pass when condition does not apply', async () => {
    const dto = plainToClass(ConditionalRequiredTestDto, {
      status: 'permanent',
      destination: undefined,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

// ========================================
// Date Range Validator Tests
// ========================================

describe('IsDateAfterOrEqual Validator', () => {
  it('should pass when end date equals start date', async () => {
    const date = '2025-11-24T10:00:00Z';
    const dto = plainToClass(DateRangeTestDto, {
      startDate: date,
      endDate: date,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when end date is after start date', async () => {
    const dto = plainToClass(DateRangeTestDto, {
      startDate: '2025-11-24T10:00:00Z',
      endDate: '2025-11-25T10:00:00Z',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when end date is before start date', async () => {
    const dto = plainToClass(DateRangeTestDto, {
      startDate: '2025-11-25T10:00:00Z',
      endDate: '2025-11-24T10:00:00Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDateAfterOrEqual');
  });

  it('should pass when end date is null/undefined', async () => {
    const dto = plainToClass(DateRangeTestDto, {
      startDate: '2025-11-24T10:00:00Z',
      endDate: undefined,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

// ========================================
// Enum Dependent Validator Tests
// ========================================

describe('IsEnumDependent Validator', () => {
  it('should pass when condition applies and value is in allowed set', async () => {
    const dto = plainToClass(EnumDependentTestDto, {
      type: 'treatment',
      productType: 'antibiotic',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when condition applies and value is not in allowed set', async () => {
    const dto = plainToClass(EnumDependentTestDto, {
      type: 'treatment',
      productType: 'invalid-value',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEnumDependent');
  });

  it('should pass when condition does not apply', async () => {
    const dto = plainToClass(EnumDependentTestDto, {
      type: 'slaughter',
      productType: 'anything-is-ok',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when condition applies but value is null', async () => {
    const dto = plainToClass(EnumDependentTestDto, {
      type: 'treatment',
      productType: null,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
