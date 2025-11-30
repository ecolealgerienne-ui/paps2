# Admin Migration Tracker - Suivi des Entités

> **Objectif** : Tracker la progression de la migration de toutes les entités de référence admin
>
> **Date de début** : 2025-11-30
>
> **Dernière mise à jour** : 2025-11-30

---

## 📊 PROGRESSION GLOBALE

**Total Entités** : 16
**Migrées** : 0 (0%)
**En cours** : 0
**Restantes** : 16

```
[░░░░░░░░░░░░░░░░░░░░] 0%
```

---

## 🎯 PHASES

| Phase | Entités | Statut | Progression |
|-------|---------|--------|-------------|
| **Phase 1** : Données Simples | 5 | ⏳ Non démarré | 0/5 (0%) |
| **Phase 2** : Données Métier | 5 | ⏳ Non démarré | 0/5 (0%) |
| **Phase 3** : Relations | 4 | ⏳ Non démarré | 0/4 (0%) |
| **Phase 4** : Master Table | 2 | ⏳ Non démarré | 0/2 (0%) |

---

## 📋 PHASE 1 : DONNÉES SIMPLES (Priorité 🔴)

### Objectif : Migrer 5 entités sans relations complexes

| # | Entité | Statut | Progression | Développeur | Début | Fin | Commit | Notes |
|---|--------|--------|-------------|-------------|-------|-----|--------|-------|
| 1 | **countries** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | **EXEMPLE COMPLET** |
| 2 | **age-categories** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |
| 3 | **units** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |
| 4 | **administration-routes** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |
| 5 | **alert-templates** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |

**Statut Phase 1** : ⏳ Non démarré (0/5)

---

## 📋 PHASE 2 : DONNÉES MÉTIER (Priorité 🟡)

### Objectif : Migrer 5 entités de référence métier

| # | Entité | Statut | Progression | Développeur | Début | Fin | Commit | Notes |
|---|--------|--------|-------------|-------------|-------|-----|--------|-------|
| 6 | **species** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | Fix `scientificName` |
| 7 | **active-substances** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |
| 8 | **therapeutic-indications** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |
| 9 | **product-categories** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |
| 10 | **product-packagings** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | - |

**Statut Phase 2** : ⏳ Non démarré (0/5)

---

## 📋 PHASE 3 : RELATIONS (Priorité 🟠)

### Objectif : Migrer 4 entités avec relations complexes

| # | Entité | Statut | Progression | Développeur | Début | Fin | Commit | Notes |
|---|--------|--------|-------------|-------------|-------|-----|--------|-------|
| 11 | **breeds** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | Relation → species |
| 12 | **breed-countries** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | Junction table |
| 13 | **national-campaigns** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | Enum CampaignType |
| 14 | **campaign-countries** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | Junction table |

**Statut Phase 3** : ⏳ Non démarré (0/4)

---

## 📋 PHASE 4 : MASTER TABLE (Priorité 🟣)

### Objectif : Migrer 2 entités avec scope global/local

| # | Entité | Statut | Progression | Développeur | Début | Fin | Commit | Notes |
|---|--------|--------|-------------|-------------|-------|-----|--------|-------|
| 15 | **veterinarians** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | 2 endpoints (global + farm) |
| 16 | **products** | ⏳ Non démarré | 0/33 (0%) | - | - | - | - | 2 endpoints (global + farm) |

**Statut Phase 4** : ⏳ Non démarré (0/2)

---

## 📈 DÉTAILS PAR ENTITÉ

### Légende Statuts
- ⏳ **Non démarré** : Pas encore commencé
- 🟡 **En cours** : Migration en cours
- 🟢 **Terminé** : Migration complète et validée
- 🔴 **Bloqué** : Problème rencontré
- ⏸️ **En pause** : Temporairement suspendu

---

## 1. Countries

**Statut** : ⏳ Non démarré
**Priorité** : 🔴 P1 (EXEMPLE COMPLET)
**Complexité** : ⭐ Simple

### Breaking Changes
- Endpoint : `/countries` → `/api/v1/countries`

### Checklist
- [ ] 0/10 Critiques
- [ ] 0/18 Importants
- [ ] 0/5 Optionnels

**Total** : 0/33 (0%)

### Notes
```
Cette entité sert d'EXEMPLE COMPLET pour valider le pattern de migration.
Toutes les autres entités doivent suivre ce modèle.
```

---

## 2. Age Categories

**Statut** : ⏳ Non démarré
**Priorité** : 🔴 P1
**Complexité** : ⭐ Simple

### Breaking Changes
- Endpoint : `/age-categories` → `/api/v1/age-categories`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 3. Units

**Statut** : ⏳ Non démarré
**Priorité** : 🔴 P1
**Complexité** : ⭐ Simple

### Breaking Changes
- Endpoint : `/units` → `/api/v1/units`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 4. Administration Routes

**Statut** : ⏳ Non démarré
**Priorité** : 🔴 P1
**Complexité** : ⭐ Simple

### Breaking Changes
- Endpoint : `/administration-routes` → `/api/v1/administration-routes`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 5. Alert Templates

**Statut** : ⏳ Non démarré
**Priorité** : 🔴 P1
**Complexité** : ⭐⭐ Moyen

### Breaking Changes
- Endpoint : `/alert-templates` → `/api/v1/alert-templates`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 6. Species

**Statut** : ⏳ Non démarré
**Priorité** : 🟡 P2
**Complexité** : ⭐⭐ Moyen

### Breaking Changes
- ❌ Pas de changement d'endpoint (déjà `/api/v1/species`)
- ✅ Ajout champ `scientificName` dans API

### Checklist
- [ ] 0/33

### Notes
```
Endpoint déjà correct, mais champ scientificName manquant dans les DTOs.
```

---

## 7. Active Substances

**Statut** : ⏳ Non démarré
**Priorité** : 🟡 P2
**Complexité** : ⭐⭐ Moyen

### Breaking Changes
- Endpoint : `/active-substances` → `/api/v1/active-substances`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 8. Therapeutic Indications

**Statut** : ⏳ Non démarré
**Priorité** : 🟡 P2
**Complexité** : ⭐⭐ Moyen

### Breaking Changes
- Endpoint : `/therapeutic-indications` → `/api/v1/therapeutic-indications`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 9. Product Categories

**Statut** : ⏳ Non démarré
**Priorité** : 🟡 P2
**Complexité** : ⭐⭐ Moyen

### Breaking Changes
- Endpoint : `/product-categories` → `/api/v1/product-categories`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 10. Product Packagings

**Statut** : ⏳ Non démarré
**Priorité** : 🟡 P2
**Complexité** : ⭐⭐ Moyen

### Breaking Changes
- Endpoint : `/product-packagings` → `/api/v1/product-packagings`

### Checklist
- [ ] 0/33

### Notes
```
-
```

---

## 11. Breeds

**Statut** : ⏳ Non démarré
**Priorité** : 🟠 P3
**Complexité** : ⭐⭐⭐ Complexe

### Breaking Changes
- ❌ Pas de changement d'endpoint (déjà `/api/v1/breeds`)

### Relations
- → species (Foreign Key: speciesId)

### Checklist
- [ ] 0/33

### Notes
```
Vérifier que la relation species est bien validée.
```

---

## 12. Breed Countries

**Statut** : ⏳ Non démarré
**Priorité** : 🟠 P3
**Complexité** : ⭐⭐⭐ Complexe

### Breaking Changes
- ❌ Pas de changement d'endpoint (déjà `/api/v1/breed-countries`)

### Relations
- → breeds (Foreign Key: breedId)
- → countries (Foreign Key: countryCode)

### Checklist
- [ ] 0/33

### Notes
```
Junction table. Vérifier transactions pour créations atomiques.
```

---

## 13. National Campaigns

**Statut** : ⏳ Non démarré
**Priorité** : 🟠 P3
**Complexité** : ⭐⭐⭐ Complexe

### Breaking Changes
- Endpoint : `/api/national-campaigns` → `/api/v1/national-campaigns`

### Enums
- CampaignType (VACCINATION, TREATMENT, PROPHYLAXIS)

### Checklist
- [ ] 0/33

### Notes
```
Vérifier que l'enum CampaignType est bien synchronisé Prisma ↔️ TypeScript.
```

---

## 14. Campaign Countries

**Statut** : ⏳ Non démarré
**Priorité** : 🟠 P3
**Complexité** : ⭐⭐⭐ Complexe

### Breaking Changes
- ❌ Pas de changement d'endpoint (déjà `/api/v1/campaign-countries`)

### Relations
- → national-campaigns (Foreign Key: campaignId)
- → countries (Foreign Key: countryCode)

### Checklist
- [ ] 0/33

### Notes
```
Junction table. Vérifier transactions.
```

---

## 15. Veterinarians

**Statut** : ⏳ Non démarré
**Priorité** : 🟣 P4
**Complexité** : ⭐⭐⭐⭐ Très complexe

### Breaking Changes
- ✅ Ajout endpoint global : `/api/v1/veterinarians` (NOUVEAU)
- ✅ Migration endpoint farm : `/farms/:farmId/veterinarians` → `/api/v1/farms/:farmId/veterinarians`

### Architecture
**Master Table Pattern avec 2 endpoints** :

1. **Global (Admin)** : `/api/v1/veterinarians`
   - GET : Tous les vétérinaires (global + local)
   - POST : Créer vétérinaire global (scope='global', farmId=null)
   - PUT/DELETE : Modifier/Supprimer global uniquement
   - Guards : `AdminGuard`

2. **Farm-Scoped (User)** : `/api/v1/farms/:farmId/veterinarians`
   - GET : Vétérinaires globaux + locaux de la ferme
   - POST : Créer vétérinaire local (scope='local', farmId=XXX)
   - PUT/DELETE : Modifier/Supprimer local de la ferme uniquement
   - Guards : `FarmOwnerGuard`

### Checklist
- [ ] 0/33

### Notes
```
Entité la plus complexe. Bien séparer la logique scope='global' vs scope='local'.
Tests exhaustifs pour isolation des scopes.
```

---

## 16. Products

**Statut** : ⏳ Non démarré
**Priorité** : 🟣 P4
**Complexité** : ⭐⭐⭐⭐ Très complexe

### Breaking Changes
- ✅ Vérifier endpoint global : `/api/v1/products` (existe déjà ?)
- ✅ Migration endpoint farm : `/farms/:farmId/products` → `/api/v1/farms/:farmId/products`

### Architecture
**Master Table Pattern avec 2 endpoints** (même logique que Veterinarians)

1. **Global (Admin)** : `/api/v1/products`
   - Produits globaux (scope='global', farmId=null)
   - Guards : `AdminGuard`

2. **Farm-Scoped (User)** : `/api/v1/farms/:farmId/products`
   - Produits globaux + locaux de la ferme
   - Guards : `FarmOwnerGuard`

### Checklist
- [ ] 0/33

### Notes
```
Même pattern que Veterinarians. Réutiliser la logique.
```

---

## 🚫 ENTITÉS EXCLUES (Non concernées par cette migration)

Ces entités suivent le pattern farm-scoped et seront migrées dans une phase ultérieure :

- animals
- treatments
- weights
- movements
- breedings
- lots
- alerts
- farm-veterinarian-preferences
- farm-national-campaign-preferences
- farm-breed-preferences
- product-preferences
- farmer-product-lots
- animal-status-history

**Note** : Migration farm-scoped = Post-MVP (Phase 5 optionnelle)

---

## 📝 NOTES GLOBALES

### Décisions Prises
- ✅ Versioning : `/api/v1/` partout
- ✅ Naming : `camelCase` dans JSON
- ✅ Migration : Big Bang (pas de backward compatibility)
- ✅ Pattern scope gardé (veterinarians, products)
- ✅ displayOrder : Auto-increment (max + 1)

### Problèmes Identifiés
```
[Liste des problèmes transverses identifiés pendant la migration]
-
```

### Leçons Apprises
```
[Leçons apprises pendant la migration pour améliorer le process]
-
```

---

## 🔄 CHANGELOG

### 2025-11-30
- ✅ Création du tracker
- ✅ Inventaire de 16 entités
- ⏳ Phase 1 en attente de démarrage

---

## 📚 RESSOURCES

- **Checklist Template** : `ADMIN_REMEDIATION_CHECKLIST.md`
- **Plan de Migration** : `ADMIN_MIGRATION_PLAN.md`
- **API Signatures** : `API_SIGNATURES_V2.md`

---

**Créé le** : 2025-11-30
**Dernière mise à jour** : 2025-11-30
**Prochain checkpoint** : Après Phase 1 (countries migré)
