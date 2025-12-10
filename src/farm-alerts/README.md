# Farm Alerts Module

Module de génération dynamique d'alertes pour les fermes.

## Architecture

```
src/farm-alerts/
├── alert-engine/           # Moteur de génération d'alertes
│   ├── generators/         # Générateurs spécialisés par catégorie
│   │   ├── base.generator.ts
│   │   ├── vaccination.generator.ts
│   │   ├── treatment.generator.ts
│   │   ├── nutrition.generator.ts
│   │   ├── reproduction.generator.ts
│   │   ├── health.generator.ts
│   │   └── administrative.generator.ts
│   ├── generator.interface.ts
│   ├── alert-engine.module.ts
│   └── alert-engine.service.ts
├── dto/
│   ├── query-farm-alert.dto.ts
│   ├── update-farm-alert.dto.ts
│   ├── farm-alert-response.dto.ts
│   └── ...
├── types/
│   └── index.ts
├── tests/
│   ├── farm-alerts.service.spec.ts
│   ├── alert-engine.service.spec.ts
│   └── vaccination.generator.spec.ts
├── farm-alerts.controller.ts
├── farm-alerts.module.ts
├── farm-alerts.service.ts
└── README.md
```

## Composants Principaux

### 1. FarmAlertsService
Service CRUD pour la gestion des alertes générées:
- `findAll()` - Liste paginée avec filtres
- `findOne()` - Détail d'une alerte
- `updateStatus()` - Changement de statut (read/dismissed/resolved)
- `markAllAsRead()` - Marquer toutes les alertes comme lues
- `getSummary()` - Résumé par catégorie/priorité/statut
- `getUnreadCount()` - Compteur d'alertes non lues
- `bulkUpdate()` - Mise à jour en masse

### 2. AlertEngineService
Orchestrateur de génération d'alertes:
- `generateForFarm(farmId)` - Génère et synchronise les alertes
- `invalidateAndRegenerate(farmId)` - Trigger après modifications métier
- `resolveAlerts(farmId, alertIds)` - Résolution manuelle

### 3. Générateurs Spécialisés
Chaque générateur implémente `AlertGenerator`:

| Catégorie | Codes d'Alerte |
|-----------|----------------|
| **vaccination** | `vaccination_due`, `campaign_vaccination_due` |
| **treatment** | `treatment_due`, `withdrawal_ending` |
| **nutrition** | `weight_stagnation`, `feeding_anomaly` |
| **reproduction** | `birth_imminent`, `heat_expected` |
| **health** | `health_check_due`, `mortality_high` |
| **administrative** | `identification_missing`, `document_expired` |

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/farms/:farmId/alerts` | Liste paginée |
| GET | `/farms/:farmId/alerts/summary` | Résumé |
| GET | `/farms/:farmId/alerts/unread-count` | Compteur non lues |
| GET | `/farms/:farmId/alerts/:id` | Détail |
| PATCH | `/farms/:farmId/alerts/:id/status` | Changement statut |
| POST | `/farms/:farmId/alerts/mark-all-read` | Tout marquer lu |
| POST | `/farms/:farmId/alerts/bulk-update` | Mise à jour masse |
| DELETE | `/farms/:farmId/alerts/:id` | Suppression douce |
| POST | `/farms/:farmId/alerts/generate` | Force régénération |

## Statuts d'Alerte

```typescript
enum FarmAlertStatus {
  pending = 'pending',     // Nouvelle alerte non lue
  read = 'read',           // Lue mais non traitée
  dismissed = 'dismissed', // Ignorée volontairement
  resolved = 'resolved',   // Résolue (action effectuée)
}
```

## Triggers Automatiques

Les alertes sont régénérées automatiquement après:
- Création/modification/suppression de **Treatments**
- Création/modification/suppression de **Breedings**
- Création/modification/suppression de **Weights**
- Création/modification/suppression de **Animals**

Implémentation non-bloquante avec `forwardRef()` pour éviter les dépendances circulaires.

## Clés I18N

Voir `I18N_KEYS.md` pour les clés de traduction.

## Tests

```bash
# Exécuter les tests
npm test -- --testPathPattern=farm-alerts

# Avec couverture
npm test -- --testPathPattern=farm-alerts --coverage
```
