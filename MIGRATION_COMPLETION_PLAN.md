# Plan de Travail - Complétion des 33 Points de Migration

## 📊 État Actuel

**16 entités Admin Reference Data:**
- ✅ 3 entités complètes à 100%: Products, Veterinarians, Therapeutic-Indications
- ⚠️ 13 entités incomplètes (manque dependency checks principalement)

---

## 🎯 Objectif

Appliquer uniformément les **33 points de vérification** sur TOUTES les 16 entités.

---

## 📋 Plan d'Exécution (5 Phases)

### **PHASE 1: DOCUMENTATION (3h estimé)**

#### Tâche 1.1: Créer les checklists manquants (3 entités)
- [ ] **Countries** (1/16) - COUNTRIES_MIGRATION_CHECKLIST.md
  - Simple entity pattern
  - ~30 minutes

- [ ] **Campaign-Countries** (13/16) - CAMPAIGN_COUNTRIES_MIGRATION_CHECKLIST.md
  - Junction table pattern
  - Créer aussi I18N_KEYS.md et TESTS_PLAN.md
  - ~45 minutes

- [ ] **National-Campaigns** (14/16) - NATIONAL_CAMPAIGNS_MIGRATION_CHECKLIST.md
  - Créer aussi I18N_KEYS.md et TESTS_PLAN.md
  - Simple entity pattern
  - ~45 minutes

#### Tâche 1.2: Vérifier les checklists existants (13 entités)
- [ ] Comparer le checklist avec le code réel
- [ ] Corriger les incohérences (ex: Breeds dit avoir dependency check mais n'en a pas)
- [ ] S'assurer que tous mentionnent les 33 points

**Livrables Phase 1:**
- 3 nouveaux checklists
- 6 fichiers de documentation (I18N + TESTS)
- 13 checklists vérifiés et corrigés

---

### **PHASE 2: DEPENDENCY CHECKS (6h estimé)**

Pour chaque entité, identifier les dépendances dans le schéma Prisma puis ajouter la vérification dans `remove()`.

#### Groupe A: Phase 1 Entities (5 entités)

**2.1 Countries** (1/16)
```typescript
// Dépendances probables:
- farms (via countryCode)
- therapeuticIndications (via countryCode)
- breedCountries (via countryCode)
- campaignCountries (via countryCode)
```
⏱️ ~30 minutes

**2.2 Age-categories** (2/16)
```typescript
// Dépendances probables:
- animals (via ageCategoryId)
- therapeuticIndications (via ageCategoryId)
```
⏱️ ~20 minutes

**2.3 Units** (3/16)
```typescript
// Dépendances probables:
- therapeuticIndications (via doseUnitId)
- farmProductPackagings (via concentrationUnitId, volumeUnitId)
```
⏱️ ~30 minutes

**2.4 Administration-routes** (4/16)
```typescript
// Dépendances probables:
- therapeuticIndications (via routeId)
- treatments (via routeId)
```
⏱️ ~20 minutes

**2.5 Alert-templates** (5/16)
```typescript
// Dépendances probables:
- alertConfigurations (via templateId)
```
⏱️ ~20 minutes

#### Groupe B: Phase 2 Entities (4 entités)

**2.6 Species** (6/16)
```typescript
// Dépendances probables:
- breeds (via speciesId)
- animals (via speciesId)
- therapeuticIndications (via speciesId)
```
⏱️ ~30 minutes

**2.7 Active-substances** (7/16)
```typescript
// Dépendances probables:
- products (via substanceId)
```
⏱️ ~20 minutes

**2.8 Product-categories** (8/16)
```typescript
// Dépendances probables:
- products (via categoryId)
```
⏱️ ~20 minutes

**2.9 Product-packagings** (9/16)
```typescript
// Dépendances probables:
- farmProductPackagings (via packagingId)
- treatments (via packagingId)
```
⏱️ ~30 minutes

#### Groupe C: Phase 3 Entities (4 entités - 3 déjà faits)

**2.10 Breeds** (11/16) ⚠️ CHECKLIST MENSONGER
```typescript
// Dépendances:
- animals (via breedId)
- breedCountries (via breedId)
- farmBreedPreferences (via breedId)
```
⏱️ ~30 minutes

**2.11 Breed-Countries** (12/16) - Junction table
```
N/A - Junction tables n'ont généralement pas de dependency checks
Mais vérifier si utilisé ailleurs
```
⏱️ ~10 minutes (vérification)

**2.12 Campaign-Countries** (13/16) - Junction table
```
N/A - Junction table
```
⏱️ ~10 minutes (vérification)

**2.13 National-Campaigns** (14/16)
```typescript
// Dépendances probables:
- campaignCountries (via campaignId)
- personalCampaigns (via nationalCampaignId)
- farmCampaignPreferences (via campaignId)
```
⏱️ ~30 minutes

**Livrables Phase 2:**
- Dependency checks ajoutés dans 13 services
- Chaque check avec message d'erreur explicite
- Tests manuels pour vérifier les checks

---

### **PHASE 3: VÉRIFICATION COMPLÈTE (2h estimé)**

#### Tâche 3.1: Checklist automatisé
Créer un script de vérification qui parcourt les 16 entités et vérifie:

```typescript
Pour chaque entité:
  ✓ Checklist existe et complet (33 points)
  ✓ I18N_KEYS.md existe
  ✓ TESTS_PLAN.md existe
  ✓ Service a dependency check (grep "Check dependencies")
  ✓ Service a restore on duplicate (si unique constraint)
  ✓ Service a optimistic locking (version++)
  ✓ Service utilise Prisma types
  ✓ Service a ternaries dans update()
  ✓ Controller utilise /api/v1/
  ✓ Controller a Guards appropriés
  ✓ Controller utilise PATCH (pas PUT)
  ✓ Controller a restore endpoint
  ✓ DTO ResponseDto avec | null
```

⏱️ ~1h pour créer le script
⏱️ ~1h pour fixer les problèmes détectés

**Livrables Phase 3:**
- Script de vérification
- Rapport d'audit complet
- Toutes les incohérences corrigées

---

### **PHASE 4: TESTS (1h estimé)**

#### Tâche 4.1: Build TypeScript
```bash
npm run build
```
- Corriger toutes les erreurs de compilation
- Vérifier les types Prisma

#### Tâche 4.2: Tests manuels critiques
Pour 2-3 entités représentatives:
- Tester dependency check (essayer de supprimer avec dépendances)
- Tester restore on duplicate
- Tester optimistic locking (version conflict)

**Livrables Phase 4:**
- Build réussi sans erreurs
- Dependency checks vérifiés fonctionnels

---

### **PHASE 5: COMMIT & DOCUMENTATION (1h estimé)**

#### Tâche 5.1: Commits organisés

**Commit 1: Documentation**
```
docs: Add missing migration checklists and documentation

- Add Countries migration checklist
- Add Campaign-Countries migration checklist and docs
- Add National-Campaigns migration checklist and docs
- Fix inaccurate checklists (Breeds, etc.)

3 checklists added, 6 documentation files added, 13 checklists corrected.
```

**Commit 2: Dependency Checks - Groupe A**
```
feat: Add dependency checks to Phase 1 entities (5/16)

Countries:
- Check farms, therapeuticIndications, breedCountries, campaignCountries

Age-categories:
- Check animals, therapeuticIndications

Units:
- Check therapeuticIndications, farmProductPackagings

Administration-routes:
- Check therapeuticIndications, treatments

Alert-templates:
- Check alertConfigurations

All entities now prevent deletion when dependencies exist.
```

**Commit 3: Dependency Checks - Groupe B**
```
feat: Add dependency checks to Phase 2 entities (4/16)

Species: breeds, animals, therapeuticIndications
Active-substances: products
Product-categories: products
Product-packagings: farmProductPackagings, treatments
```

**Commit 4: Dependency Checks - Groupe C**
```
feat: Add dependency checks to Phase 3 entities (4/16)

Breeds: animals, breedCountries, farmBreedPreferences
National-Campaigns: campaignCountries, personalCampaigns, farmCampaignPreferences

Note: Junction tables (Breed-Countries, Campaign-Countries) verified - no dependency checks needed.
```

**Commit 5: Final verification**
```
chore: Verify all 16 entities meet 33-point migration standard

- Add verification script
- Update all checklists to 100% completion
- Document any exceptions (junction tables, etc.)

All 16 Admin Reference Data entities now fully migrated.
```

#### Tâche 5.2: Documentation globale
- [ ] Créer MIGRATION_SUMMARY.md récapitulatif
- [ ] Mettre à jour le README si nécessaire

**Livrables Phase 5:**
- 5 commits propres et pushés
- Documentation globale
- Rapport final de complétion

---

## 📊 Estimation Totale

| Phase | Tâches | Temps Estimé |
|-------|--------|--------------|
| Phase 1 | Documentation | 3h |
| Phase 2 | Dependency Checks | 6h |
| Phase 3 | Vérification | 2h |
| Phase 4 | Tests | 1h |
| Phase 5 | Commit & Docs | 1h |
| **TOTAL** | | **13h** |

**Soit environ 2 jours de travail.**

---

## 🎯 Résultat Final Attendu

✅ **16/16 entités** avec:
- [x] 33/33 points de vérification
- [x] Checklist de migration complet
- [x] Documentation (I18N + Tests)
- [x] Dependency checks fonctionnels
- [x] Restore on duplicate (si applicable)
- [x] Code cohérent et maintenable

---

## 🚀 Prêt à Démarrer?

**Ordre d'exécution recommandé:**
1. ✅ Commencer par Phase 1 (documentation) - plus facile, donne une vue d'ensemble
2. ✅ Continuer avec Phase 2 (dependency checks) - le gros du travail
3. ✅ Phase 3 (vérification automatisée) - détecte ce qu'on a raté
4. ✅ Phase 4 (tests) - validation
5. ✅ Phase 5 (commits propres) - livraison

**On commence par la Phase 1 (Documentation)?**
