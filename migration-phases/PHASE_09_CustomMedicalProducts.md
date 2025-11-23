# 🔧 PHASE 09 : Custom Medical Products

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `custom_medical_products` |
| **Type** | Renommage table (MedicalProduct → custom_medical_products) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 1h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |

---

## 🎯 Objectifs

1. ✅ Renommer table existante `MedicalProduct` → `custom_medical_products`
2. ✅ Ajouter soft delete + versioning
3. ✅ Clarifier : produits **personnalisés par ferme** (≠ global)
4. ✅ Lier à `farmId`

---

## 📊 Schéma Prisma

```prisma
// Produit médical personnalisé (créé par la ferme)
model CustomMedicalProduct {
  id                String    @id @default(uuid())
  farmId            String    @map("farm_id")
  name              String
  description       String?
  type              String?
  dosage            String?
  laboratoire       String?
  version           Int       @default(1)
  deletedAt         DateTime? @map("deleted_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  farm              Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  farmPreferences   FarmProductPreference[]

  @@index([farmId])
  @@index([deletedAt])
  @@map("custom_medical_products")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- Renommer table (si existe déjà sous ancien nom)
ALTER TABLE IF EXISTS medical_products_custom RENAME TO custom_medical_products;

-- Ajouter colonnes soft delete/versioning (si pas déjà présentes)
ALTER TABLE custom_medical_products
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Créer indexes
CREATE INDEX IF NOT EXISTS idx_custom_medical_products_farm_id ON custom_medical_products(farm_id);
CREATE INDEX IF NOT EXISTS idx_custom_medical_products_deleted_at ON custom_medical_products(deleted_at);

-- Trigger
CREATE TRIGGER update_custom_medical_products_updated_at
    BEFORE UPDATE ON custom_medical_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('custom-medical-products')
@Controller('custom-medical-products')
export class CustomMedicalProductsController {
  @Get('farm/:farmId')
  findByFarm(@Param('farmId') farmId: string) {
    return this.service.findByFarm(farmId);
  }

  @Post('farm/:farmId')
  create(@Param('farmId') farmId: string, @Body() dto: CreateCustomProductDto) {
    return this.service.create(farmId, dto);
  }
}
```

---

## ✅ Checklist

- [ ] Table renommée `custom_medical_products`
- [ ] Champs soft delete + versioning ajoutés
- [ ] Indexes créés
- [ ] API filtre par farmId
- [ ] Tests

**Phase 09 : TERMINÉE** ✅
