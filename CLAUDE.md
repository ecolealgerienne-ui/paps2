# CLAUDE.md - Mémoire de Session

## Contexte Projet

**Projet** : AniTra Backend - Application de gestion d'élevage
**Stack** : NestJS v10 + TypeScript v5 + Prisma v5 + PostgreSQL 16
**Architecture** : Multi-tenancy avec isolation par `farmId`

---

## Directives Marché

**IMPORTANT - À lire avant chaque session :**

- **Marché prioritaire** : France (FR)
- **Marché secondaire** : Europe (EU)
- **Marché NON ciblé** : Algérie - Ne pas développer de fonctionnalités spécifiques à ce marché

Les développements doivent respecter :
- Réglementations françaises (identification animale, traçabilité)
- Standards européens (EU)
- Langues : FR prioritaire, EN secondaire

---

## Normes de Développement

### Architecture
- Pattern multi-tenancy avec `farmId` obligatoire
- Soft delete uniquement (`deletedAt`)
- Versioning optimistic (`version` field)
- DTOs avec `class-validator` pour toutes les entrées

### API REST
- Base URL : `/api/v1`
- Routes : `/farms/{farmId}/[entity]`
- Pagination : `?page=1&limit=20&sort=createdAt&order=desc`
- Format réponse : `{ success, data, meta }`

### Logging
- `debug()` : Détails techniques
- `audit()` : Opérations métier (toujours actif)
- `error()` : Erreurs (toujours actif)

### Codes d'Erreur
- Utiliser `error-codes.ts` pour la traduction FR/EN

---

## Procédures de Session

### Démarrage de session
1. Vérifier que `main` est à jour (`git fetch origin`)
2. Créer/utiliser la branche de session `claude/*`
3. Lire ce fichier CLAUDE.md pour le contexte

### Récupération des modifications des sessions précédentes
1. Lister les branches `claude/*` distantes : `git branch -r | grep claude/`
2. Identifier celles avec des commits non mergés dans main
3. Les merger dans la nouvelle branche si pertinent

---

## Sessions Précédentes

### Session 2024-12-12
- Analyse des specs évolutions Page Lots
- Implémentation planifiée :
  - P1.1 : `currentLot` dans GET /animals
  - P1.2 : filtre `lotId` dans GET /weights
  - P1.3 : Pagination `/lots/stats`
  - P2.1 : GET `/lots/{id}/stats`
  - P2.2 : GET `/lots/{id}/events`
  - P3 : POST `/lots/transfer-animals`
