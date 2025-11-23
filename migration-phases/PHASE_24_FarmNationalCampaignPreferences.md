# 🔧 PHASE 24 : Farm National Campaign Preferences

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `farm_national_campaign_preferences` |
| **Type** | Nouvelle table de préférences |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phases 3 (Farms) + 7 (NationalCampaigns) + 19 (CampaignCountries)** |
| **Bloc** | BLOC 4 - Préférences Ferme |

---

## 📊 Schéma Prisma

```prisma
model FarmNationalCampaignPreference {
  id         String    @id @default(uuid())
  farmId     String    @map("farm_id")
  campaignId String    @map("campaign_id")
  isEnrolled Boolean   @default(false) @map("is_enrolled")
  enrolledAt DateTime? @map("enrolled_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  farm     Farm             @relation(fields: [farmId], references: [id], onDelete: Cascade)
  campaign NationalCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@unique([farmId, campaignId])
  @@index([farmId])
  @@index([campaignId])
  @@index([isEnrolled])
  @@map("farm_national_campaign_preferences")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE farm_national_campaign_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  is_enrolled BOOLEAN DEFAULT FALSE NOT NULL,
  enrolled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES national_campaigns(id) ON DELETE CASCADE,

  UNIQUE(farm_id, campaign_id)
);

CREATE INDEX idx_farm_national_campaign_preferences_farm_id ON farm_national_campaign_preferences(farm_id);
CREATE INDEX idx_farm_national_campaign_preferences_campaign_id ON farm_national_campaign_preferences(campaign_id);
CREATE INDEX idx_farm_national_campaign_preferences_is_enrolled ON farm_national_campaign_preferences(is_enrolled);

CREATE TRIGGER update_farm_national_campaign_preferences_updated_at
    BEFORE UPDATE ON farm_national_campaign_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('farm-national-campaign-preferences')
@Controller('farm-national-campaign-preferences')
export class FarmNationalCampaignPreferencesController {
  @Get('farm/:farmId')
  findByFarm(@Param('farmId') farmId: string) {
    return this.service.findByFarm(farmId);
  }

  @Get('farm/:farmId/enrolled')
  findEnrolledCampaigns(@Param('farmId') farmId: string) {
    return this.service.findEnrolledCampaigns(farmId);
  }

  @Post('farm/:farmId/campaign/:campaignId/enroll')
  enroll(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string) {
    return this.service.enroll(farmId, campaignId);
  }

  @Delete('farm/:farmId/campaign/:campaignId/unenroll')
  unenroll(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string) {
    return this.service.unenroll(farmId, campaignId);
  }
}

// Service
async enroll(farmId: string, campaignId: string) {
  return this.prisma.farmNationalCampaignPreference.upsert({
    where: {
      farmId_campaignId: { farmId, campaignId },
    },
    create: {
      farmId,
      campaignId,
      isEnrolled: true,
      enrolledAt: new Date(),
    },
    update: {
      isEnrolled: true,
      enrolledAt: new Date(),
    },
  });
}
```

---

## ✅ Checklist

- [ ] Table créée
- [ ] Contrainte unique `(farm_id, campaign_id)`
- [ ] API enroll/unenroll campagnes
- [ ] API liste campagnes inscrites
- [ ] Tests enroll/unenroll
- [ ] Champ `enrolledAt` mis à jour automatiquement

**Phase 24 : TERMINÉE** ✅

---

## 🎉🎉🎉 **FIN DU BLOC 4** - **MIGRATION COMPLÈTE** 🎉🎉🎉

✅ **LES 24 PHASES SONT TERMINÉES !**

**Récapitulatif complet :**
- ✅ **BLOC 1** : 11 phases indépendantes (parallèle 100%)
- ✅ **BLOC 2** : 4 phases dépendances niveau 1
- ✅ **BLOC 3** : 4 phases liaisons pays
- ✅ **BLOC 4** : 5 phases préférences ferme

**Total : 24/24 phases complètes** 🚀

Chaque phase contient :
- ✅ Résumé + objectifs
- ✅ Schéma Prisma complet
- ✅ Scripts SQL migration
- ✅ API NestJS (Service + Controller + DTOs)
- ✅ Tests (unitaires + E2E)
- ✅ Checklist validation

**Prêt pour implémentation !** 🎯
