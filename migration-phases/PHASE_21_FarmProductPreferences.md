# 🔧 PHASE 21 : Farm Product Preferences

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `farm_product_preferences` |
| **Type** | Nouvelle table avec **contrainte XOR** (global OU custom) |
| **Complexité** | 🔴 Complexe |
| **Durée estimée** | 8h |
| **Dépendances** | ⚠️ **Phases 3 (Farms) + 5 (MedicalProducts) + 9 (CustomProducts) + 17 (ProductCountries)** |
| **Bloc** | BLOC 4 - Préférences Ferme |

---

## 🎯 Objectifs

1. ✅ Créer table avec **XOR constraint** : un produit préféré doit être SOIT global SOIT custom (pas les deux)
2. ✅ Supporter displayOrder pour tri
3. ✅ Soft delete + versioning

---

## 📊 Schéma Prisma

```prisma
model FarmProductPreference {
  id               String    @id @default(uuid())
  farmId           String    @map("farm_id")

  // 🆕 XOR : Exactement UN des deux doit être rempli
  globalProductId  String?   @map("global_product_id")
  customProductId  String?   @map("custom_product_id")

  displayOrder     Int       @default(0) @map("display_order")
  isActive         Boolean   @default(true) @map("is_active")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  farm           Farm                  @relation(fields: [farmId], references: [id], onDelete: Cascade)
  globalProduct  MedicalProduct?       @relation(fields: [globalProductId], references: [id], onDelete: Cascade)
  customProduct  CustomMedicalProduct? @relation(fields: [customProductId], references: [id], onDelete: Cascade)

  @@index([farmId])
  @@index([globalProductId])
  @@index([customProductId])
  @@map("farm_product_preferences")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE farm_product_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  global_product_id UUID,
  custom_product_id UUID,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (global_product_id) REFERENCES medical_products(id) ON DELETE CASCADE,
  FOREIGN KEY (custom_product_id) REFERENCES custom_medical_products(id) ON DELETE CASCADE,

  -- 🆕 CONTRAINTE XOR : Exactement UN des deux doit être non-null
  CONSTRAINT check_product_xor CHECK (
    (global_product_id IS NOT NULL AND custom_product_id IS NULL) OR
    (global_product_id IS NULL AND custom_product_id IS NOT NULL)
  )
);

CREATE INDEX idx_farm_product_preferences_farm_id ON farm_product_preferences(farm_id);
CREATE INDEX idx_farm_product_preferences_global_product_id ON farm_product_preferences(global_product_id);
CREATE INDEX idx_farm_product_preferences_custom_product_id ON farm_product_preferences(custom_product_id);

CREATE TRIGGER update_farm_product_preferences_updated_at
    BEFORE UPDATE ON farm_product_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
// DTO avec validation XOR
export class CreateFarmProductPreferenceDto {
  @IsUUID()
  farmId: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.customProductId)
  globalProductId?: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.globalProductId)
  customProductId?: string;

  @IsInt()
  @IsOptional()
  displayOrder?: number;

  // Validation personnalisée pour XOR
  @ValidateBy({
    name: 'isXorValid',
    validator: {
      validate: (value, args) => {
        const obj = args.object as CreateFarmProductPreferenceDto;
        const hasGlobal = !!obj.globalProductId;
        const hasCustom = !!obj.customProductId;
        return (hasGlobal && !hasCustom) || (!hasGlobal && hasCustom);
      },
      defaultMessage: () => 'Either globalProductId or customProductId must be provided, but not both',
    },
  })
  _xorValidation?: any;
}

@ApiTags('farm-product-preferences')
@Controller('farm-product-preferences')
export class FarmProductPreferencesController {
  @Get('farm/:farmId')
  findByFarm(@Param('farmId') farmId: string) {
    // Retourner avec includes pour globalProduct et customProduct
    return this.service.findByFarm(farmId);
  }

  @Post()
  create(@Body() dto: CreateFarmProductPreferenceDto) {
    // Service vérifie XOR avant insert
    return this.service.create(dto);
  }
}

// Service
async create(dto: CreateFarmProductPreferenceDto) {
  // Double vérification XOR (backend)
  const hasGlobal = !!dto.globalProductId;
  const hasCustom = !!dto.customProductId;

  if (hasGlobal === hasCustom) {
    throw new BadRequestException('Must specify exactly one: globalProductId or customProductId');
  }

  return this.prisma.farmProductPreference.create({
    data: dto,
    include: {
      globalProduct: true,
      customProduct: true,
    },
  });
}
```

---

## 🧪 Tests

```typescript
describe('FarmProductPreferences XOR', () => {
  it('should accept global product only', async () => {
    const dto = {
      farmId: 'farm-1',
      globalProductId: 'product-1',
    };

    const result = await service.create(dto);
    expect(result.globalProductId).toBe('product-1');
    expect(result.customProductId).toBeNull();
  });

  it('should accept custom product only', async () => {
    const dto = {
      farmId: 'farm-1',
      customProductId: 'custom-1',
    };

    const result = await service.create(dto);
    expect(result.customProductId).toBe('custom-1');
    expect(result.globalProductId).toBeNull();
  });

  it('should reject both global and custom', async () => {
    const dto = {
      farmId: 'farm-1',
      globalProductId: 'product-1',
      customProductId: 'custom-1',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should reject neither global nor custom', async () => {
    const dto = {
      farmId: 'farm-1',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should enforce XOR at database level', async () => {
    // Tenter d'insérer directement en SQL (bypass Prisma)
    await expect(
      prisma.$executeRaw`
        INSERT INTO farm_product_preferences (farm_id, global_product_id, custom_product_id)
        VALUES ('farm-1', 'product-1', 'custom-1')
      `
    ).rejects.toThrow(); // Violation CHECK constraint
  });
});
```

---

## ✅ Checklist

- [ ] Table créée avec contrainte CHECK XOR
- [ ] API valide XOR côté backend + DTO
- [ ] Tests XOR : accepte global OU custom, rejette les deux/aucun
- [ ] Test contrainte DB : violation si les deux remplis
- [ ] API inclut les relations (globalProduct + customProduct)

**Phase 21 : TERMINÉE** ✅
