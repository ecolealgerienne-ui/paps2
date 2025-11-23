# 🔧 PHASE 13 : Veterinarians

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `Veterinarians` |
| **Type** | Corrections + géo + CHECK + index composites |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 3h |
| **Dépendances** | ⚠️ **Phase 3 (Farms)** |
| **Bloc** | BLOC 2 - Dépendances Niveau 1 |

---

## 📊 Schéma Prisma

```prisma
model Veterinarian {
  id          String    @id @default(uuid())
  farmId      String    @map("farm_id")
  name        String
  phone       String?
  email       String?
  address     String?

  // 🆕 Champs géographiques
  department  String?   // Ex: "81", "2A"
  commune     String?   // Ex: "81004"

  license     String?   // Numéro ordre vétérinaire
  speciality  String?
  isDefault   Boolean   @default(false) @map("is_default")
  isActive    Boolean   @default(true) @map("is_active")
  version     Int       @default(1)
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  farm                 Farm                           @relation(fields: [farmId], references: [id], onDelete: Cascade)
  farmPreferences      FarmVeterinarianPreference[]

  @@index([farmId])
  @@index([deletedAt])
  @@index([isActive])
  @@index([isDefault])
  @@index([department])

  // 🆕 Index composites
  @@index([farmId, isActive, deletedAt])   // Vétérinaires actifs d'une ferme
  @@index([department, isActive])          // Vétérinaires par département
  @@index([farmId, isDefault])             // Vétérinaire par défaut

  @@map("veterinarians")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- Ajouter colonnes
ALTER TABLE veterinarians
  ADD COLUMN IF NOT EXISTS department VARCHAR(3),
  ADD COLUMN IF NOT EXISTS commune VARCHAR(5),
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 🆕 Contraintes CHECK géographiques
ALTER TABLE veterinarians
  ADD CONSTRAINT check_vet_department_format
  CHECK (department IS NULL OR department ~ '^[0-9A-Z]{2,3}$'),

  ADD CONSTRAINT check_vet_commune_format
  CHECK (commune IS NULL OR commune ~ '^[0-9]{5}$');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_veterinarians_deleted_at ON veterinarians(deleted_at);
CREATE INDEX IF NOT EXISTS idx_veterinarians_department ON veterinarians(department);

-- 🆕 Index composites
CREATE INDEX IF NOT EXISTS idx_vets_farm_active ON veterinarians(farm_id, is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_vets_dept_active ON veterinarians(department, is_active);
CREATE INDEX IF NOT EXISTS idx_vets_farm_default ON veterinarians(farm_id, is_default);

-- Trigger
CREATE TRIGGER update_veterinarians_updated_at
    BEFORE UPDATE ON veterinarians
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('veterinarians')
@Controller('veterinarians')
export class VeterinariansController {
  @Get('farm/:farmId')
  findByFarm(@Param('farmId') farmId: string) {
    return this.service.findByFarm(farmId);
  }

  @Get('farm/:farmId/default')
  findDefault(@Param('farmId') farmId: string) {
    return this.service.findDefault(farmId);
  }

  @Get('search/department/:dept')
  findByDepartment(@Param('dept') department: string) {
    // Utilise index composite : idx_vets_dept_active
    return this.service.findByDepartment(department);
  }

  @Patch(':id/set-default')
  setDefault(@Param('id') id: string, @Body('farmId') farmId: string) {
    return this.service.setDefault(id, farmId);
  }
}
```

---

## ✅ Checklist

- [ ] Champs géo (`department`, `commune`) ajoutés
- [ ] Contraintes CHECK sur formats
- [ ] Soft delete + versioning
- [ ] Index composites créés
- [ ] API recherche par département
- [ ] Gestion vétérinaire par défaut (un seul par ferme)
- [ ] Tests validation formats géo

**Phase 13 : TERMINÉE** ✅
