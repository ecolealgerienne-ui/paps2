// src/common/types/prisma-types.ts
// Types locaux pour contourner l'absence de génération Prisma client
// Ces types doivent correspondre exactement aux enums dans schema.prisma

export enum DataScope {
  global = 'global',
  local = 'local',
}

export enum ProductType {
  antibiotic = 'antibiotic',
  anti_inflammatory = 'anti_inflammatory',
  antiparasitic = 'antiparasitic',
  vitamin = 'vitamin',
  mineral = 'mineral',
  vaccine = 'vaccine',
  anesthetic = 'anesthetic',
  hormone = 'hormone',
  antiseptic = 'antiseptic',
  analgesic = 'analgesic',
  other = 'other',
}

export enum TreatmentType {
  treatment = 'treatment',
  vaccination = 'vaccination',
}

export enum VaccinationType {
  mandatory = 'mandatory',
  recommended = 'recommended',
  optional = 'optional',
}

export enum UnitType {
  mass = 'mass',
  volume = 'volume',
  concentration = 'concentration',
  count = 'count',
  percentage = 'percentage',
  other = 'other',
}
