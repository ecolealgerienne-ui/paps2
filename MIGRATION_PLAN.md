# 🚀 Plan de Migration - PAPS2 Backend

**Date** : 2025-11-23
**Version** : 2.0
**Type** : Migration complète par phases (1 phase = 1 table)
**Approche** : DB + Prisma + API + Tests (complet)

---

## 📊 Vue d'ensemble

| Métrique | Valeur |
|----------|---------|
| **Nombre total de phases** | 24 |
| **Tables existantes modifiées** | 10 |
| **Nouvelles tables créées** | 14 |
| **Durée estimée (2 devs)** | 2-3 semaines |
| **Durée estimée (5 devs)** | 1 semaine |
| **Approche** | Phases indépendantes parallélisables |

---

## 🎯 Principe : 1 Phase = 1 Table Complète

Chaque phase inclut **TOUT** :
- ✅ **Prisma schema** (modifications/création)
- ✅ **Migration SQL** (scripts + seed data si applicable)
- ✅ **API NestJS** (Service + Controller + DTOs)
- ✅ **Tests** (Unitaires + E2E)
- ✅ **Documentation** (si nécessaire)

**Avantage** : Un développeur peut prendre **1 phase = 1 fichier** et la compléter de A à Z.

---

## 📋 BLOC 1 : Phases Indépendantes (✅ **PARALLÈLE 100%**)

**Durée** : 1 semaine (avec 5 devs en parallèle)

| Phase | Table | Type | Complexité | Durée | Détails |
|-------|-------|------|------------|-------|---------|
| **1** | Species | Corrections | 🟢 Simple | 2h | [PHASE_01_Species.md](migration-phases/PHASE_01_Species.md) |
| **2** | AdministrationRoute | Corrections | 🟢 Simple | 2h | [PHASE_02_AdministrationRoute.md](migration-phases/PHASE_02_AdministrationRoute.md) |
| **3** | Farms | Corrections + Geo + CHECK | 🟡 Moyenne | 3h | [PHASE_03_Farms.md](migration-phases/PHASE_03_Farms.md) |
| **4** | countries | Nouvelle globale | 🟡 Moyenne | 5h | [PHASE_04_Countries.md](migration-phases/PHASE_04_Countries.md) |
| **5** | medical_products (global) | Nouvelle globale + CRUD | 🟡 Moyenne | 6h | [PHASE_05_MedicalProductsGlobal.md](migration-phases/PHASE_05_MedicalProductsGlobal.md) |
| **6** | vaccines (global) | Nouvelle globale + CRUD | 🟡 Moyenne | 6h | [PHASE_06_VaccinesGlobal.md](migration-phases/PHASE_06_VaccinesGlobal.md) |
| **7** | national_campaigns | Nouvelle globale + CRUD | 🟡 Moyenne | 5h | [PHASE_07_NationalCampaigns.md](migration-phases/PHASE_07_NationalCampaigns.md) |
| **8** | alert_templates | Nouvelle globale + CRUD | 🟡 Moyenne | 4h | [PHASE_08_AlertTemplates.md](migration-phases/PHASE_08_AlertTemplates.md) |
| **9** | custom_medical_products | Renommage table | 🟢 Simple | 1h | [PHASE_09_CustomMedicalProducts.md](migration-phases/PHASE_09_CustomMedicalProducts.md) |
| **10** | custom_vaccines | Renommage table | 🟢 Simple | 1h | [PHASE_10_CustomVaccines.md](migration-phases/PHASE_10_CustomVaccines.md) |
| **11** | personal_campaigns | Renommage + ENUM | 🟢 Simple | 2h | [PHASE_11_PersonalCampaigns.md](migration-phases/PHASE_11_PersonalCampaigns.md) |

**Total Bloc 1** : 37h → **1 semaine avec 5 devs en parallèle** 🚀

---

## 📋 BLOC 2 : Dépendances Niveau 1 (⚠️ **APRÈS BLOC 1**)

**Durée** : 2 jours (avec 4 devs en parallèle)

| Phase | Table | Dépend de | Complexité | Durée | Détails |
|-------|-------|-----------|------------|-------|---------|
| **12** | Breeds | Phase 1 (Species) | 🟢 Simple | 2h | [PHASE_12_Breeds.md](migration-phases/PHASE_12_Breeds.md) |
| **13** | Veterinarians | Phase 3 (Farms) | 🟡 Moyenne | 3h | [PHASE_13_Veterinarians.md](migration-phases/PHASE_13_Veterinarians.md) |
| **14** | AlertConfiguration | Phase 3 (Farms) | 🟡 Moyenne | 2h | [PHASE_14_AlertConfiguration.md](migration-phases/PHASE_14_AlertConfiguration.md) |
| **15** | FarmPreferences | Phase 3 (Farms) | 🟡 Moyenne | 2h | [PHASE_15_FarmPreferences.md](migration-phases/PHASE_15_FarmPreferences.md) |

**Total Bloc 2** : 9h → **2 jours avec 4 devs en parallèle** 🚀

---

## 📋 BLOC 3 : Dépendances Niveau 2 - Liaisons Pays (⚠️ **APRÈS BLOCS 1 & 2**)

**Durée** : 1 jour (avec 4 devs en parallèle)

| Phase | Table | Dépend de | Complexité | Durée | Détails |
|-------|-------|-----------|------------|-------|---------|
| **16** | breed_countries | Phases 12 + 4 | 🟢 Simple | 2h | [PHASE_16_BreedCountries.md](migration-phases/PHASE_16_BreedCountries.md) |
| **17** | product_countries | Phases 5 + 4 | 🟢 Simple | 2h | [PHASE_17_ProductCountries.md](migration-phases/PHASE_17_ProductCountries.md) |
| **18** | vaccine_countries | Phases 6 + 4 | 🟢 Simple | 2h | [PHASE_18_VaccineCountries.md](migration-phases/PHASE_18_VaccineCountries.md) |
| **19** | campaign_countries | Phases 7 + 4 | 🟢 Simple | 2h | [PHASE_19_CampaignCountries.md](migration-phases/PHASE_19_CampaignCountries.md) |

**Total Bloc 3** : 8h → **1 jour avec 4 devs en parallèle** 🚀

---

## 📋 BLOC 4 : Dépendances Niveau 3 - Préférences Ferme (⚠️ **APRÈS BLOCS 1-3**)

**Durée** : 2 jours (avec 5 devs en parallèle)

| Phase | Table | Dépend de | Complexité | Durée | Détails |
|-------|-------|-----------|------------|-------|---------|
| **20** | farm_breed_preferences | Phases 3,12,16 | 🟡 Moyenne | 3h | [PHASE_20_FarmBreedPreferences.md](migration-phases/PHASE_20_FarmBreedPreferences.md) |
| **21** | farm_product_preferences | Phases 3,5,9,17 | 🔴 Complexe (XOR) | 8h | [PHASE_21_FarmProductPreferences.md](migration-phases/PHASE_21_FarmProductPreferences.md) |
| **22** | farm_vaccine_preferences | Phases 3,6,10,18 | 🟡 Moyenne | 3h | [PHASE_22_FarmVaccinePreferences.md](migration-phases/PHASE_22_FarmVaccinePreferences.md) |
| **23** | farm_veterinarian_preferences | Phases 3,13 | 🟢 Simple | 2h | [PHASE_23_FarmVeterinarianPreferences.md](migration-phases/PHASE_23_FarmVeterinarianPreferences.md) |
| **24** | farm_national_campaign_preferences | Phases 3,7,19 | 🟢 Simple | 2h | [PHASE_24_FarmNationalCampaignPreferences.md](migration-phases/PHASE_24_FarmNationalCampaignPreferences.md) |

**Total Bloc 4** : 18h → **2 jours avec 5 devs en parallèle** 🚀

---

## 📊 Timeline Optimisée

### **Scénario : 5 développeurs en parallèle**

```
┌────────────────────────────────────────────────────────────────┐
│                    TIMELINE (5 DEVS)                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SEMAINE 1 : BLOC 1 (11 phases en parallèle)                   │
│  ├─ Dev 1 : Phases 1, 2 (4h)                                   │
│  ├─ Dev 2 : Phases 3, 4 (8h)                                   │
│  ├─ Dev 3 : Phases 5, 6 (12h)                                  │
│  ├─ Dev 4 : Phases 7, 8 (9h)                                   │
│  └─ Dev 5 : Phases 9, 10, 11 (4h)                              │
│                                                                 │
│  SEMAINE 2 : BLOCS 2-4 (13 phases séquentielles/parallèles)    │
│  ├─ Jours 1-2 : BLOC 2 (4 phases en parallèle)                 │
│  ├─ Jour 3 : BLOC 3 (4 phases en parallèle)                    │
│  └─ Jours 4-5 : BLOC 4 (5 phases en parallèle)                 │
│                                                                 │
│  SEMAINE 3 : TESTS RÉGRESSION + DOCUMENTATION                  │
│  └─ Tests end-to-end, validation complète                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

📉 AVEC 1 DEV SÉQUENTIEL : ~3 mois (72h / 40h/semaine)
📈 AVEC 5 DEVS PARALLÈLE : ~2 semaines
🚀 GAIN DE TEMPS : 85%
```

---

## 🔗 Graphe de Dépendances

```
BLOC 1 (INDÉPENDANTES - Parallèle 100%)
├─ Species (1)
├─ AdministrationRoute (2)
├─ Farms (3)
├─ countries (4)
├─ medical_products global (5)
├─ vaccines global (6)
├─ national_campaigns (7)
├─ alert_templates (8)
├─ custom_medical_products (9)
├─ custom_vaccines (10)
└─ personal_campaigns (11)
       ↓
BLOC 2 (DÉPENDANCES NIV 1 - Parallèle après Bloc 1)
├─ Breeds (12) ← dépend Species (1)
├─ Veterinarians (13) ← dépend Farms (3)
├─ AlertConfiguration (14) ← dépend Farms (3)
└─ FarmPreferences (15) ← dépend Farms (3)
       ↓
BLOC 3 (LIAISONS PAYS - Parallèle après Blocs 1-2)
├─ breed_countries (16) ← dépend Breeds (12) + countries (4)
├─ product_countries (17) ← dépend medical_products (5) + countries (4)
├─ vaccine_countries (18) ← dépend vaccines (6) + countries (4)
└─ campaign_countries (19) ← dépend national_campaigns (7) + countries (4)
       ↓
BLOC 4 (PRÉFÉRENCES - Parallèle après Blocs 1-3)
├─ farm_breed_preferences (20) ← dépend Farms (3) + Breeds (12) + breed_countries (16)
├─ farm_product_preferences (21) ← dépend Farms (3) + medical_products (5) + custom (9) + liaison (17)
├─ farm_vaccine_preferences (22) ← dépend Farms (3) + vaccines (6) + custom (10) + liaison (18)
├─ farm_veterinarian_preferences (23) ← dépend Farms (3) + Veterinarians (13)
└─ farm_national_campaign_preferences (24) ← dépend Farms (3) + national_campaigns (7) + liaison (19)
```

---

## ✅ Checklist Globale

### **BLOC 1 : Indépendantes** (11 phases)
- [ ] Phase 1 : Species
- [ ] Phase 2 : AdministrationRoute
- [ ] Phase 3 : Farms
- [ ] Phase 4 : countries
- [ ] Phase 5 : medical_products (global)
- [ ] Phase 6 : vaccines (global)
- [ ] Phase 7 : national_campaigns
- [ ] Phase 8 : alert_templates
- [ ] Phase 9 : custom_medical_products
- [ ] Phase 10 : custom_vaccines
- [ ] Phase 11 : personal_campaigns

### **BLOC 2 : Dépendances Niveau 1** (4 phases)
- [ ] Phase 12 : Breeds
- [ ] Phase 13 : Veterinarians
- [ ] Phase 14 : AlertConfiguration
- [ ] Phase 15 : FarmPreferences

### **BLOC 3 : Liaisons Pays** (4 phases)
- [ ] Phase 16 : breed_countries
- [ ] Phase 17 : product_countries
- [ ] Phase 18 : vaccine_countries
- [ ] Phase 19 : campaign_countries

### **BLOC 4 : Préférences Ferme** (5 phases)
- [ ] Phase 20 : farm_breed_preferences
- [ ] Phase 21 : farm_product_preferences
- [ ] Phase 22 : farm_vaccine_preferences
- [ ] Phase 23 : farm_veterinarian_preferences
- [ ] Phase 24 : farm_national_campaign_preferences

---

## 📚 Documentation Détaillée

Chaque phase a son propre fichier détaillé dans le dossier `migration-phases/` :

- **PHASE_XX_TableName.md** contient :
  - Résumé (durée, complexité, dépendances)
  - Prisma schema complet
  - Scripts SQL migration
  - Code API NestJS (Service + Controller + DTOs)
  - Tests (unitaires + E2E)
  - Checklist de validation

**Exemple** : [migration-phases/PHASE_01_Species.md](migration-phases/PHASE_01_Species.md)

---

## 🎯 Recommandations

### **Pour 1-2 développeurs**
- Suivre l'ordre séquentiel BLOC 1 → 2 → 3 → 4
- Durée : 3-4 semaines

### **Pour 3-5 développeurs**
- **Semaine 1** : BLOC 1 en parallèle (chacun prend 2-3 phases)
- **Semaine 2** : BLOCS 2-4 en séquentiel/parallèle
- Durée : 2-3 semaines 🚀

### **Pour 6+ développeurs**
- Parallélisation maximale
- Durée : 1-2 semaines 🚀🚀

---

## ⚠️ Points d'attention

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Oublier une dépendance | 🔴 Bloquant | Vérifier graphe avant de commencer une phase |
| Tests insuffisants | 🔴 Bugs en prod | Checklist validation stricte par phase |
| Seed data incomplet | 🟡 Fonctionnel limité | Review seed data avec expert métier |
| Conflits de merge | 🟡 Ralentissement | Coordination via MIGRATION_PLAN.md |

---

## 🚀 Démarrage

1. ✅ Lire ce plan complet
2. ✅ Choisir les phases à implémenter (selon nombre de devs)
3. ✅ Ouvrir le fichier de phase détaillé (`migration-phases/PHASE_XX_*.md`)
4. ✅ Suivre les étapes : Prisma → SQL → API → Tests
5. ✅ Cocher la phase dans ce document une fois terminée
6. ✅ Passer à la phase suivante (respecter dépendances !)

---

**Version** : 2.0
**Dernière mise à jour** : 2025-11-23
**Statut** : ✅ PRÊT POUR IMPLÉMENTATION
