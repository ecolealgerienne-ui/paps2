// ========== ANIMAL STATUS ==========
export enum AnimalStatus {
  ALIVE = 'alive',
  SOLD = 'sold',
  DEAD = 'dead',
  SLAUGHTERED = 'slaughtered',
  DRAFT = 'draft',
}

// ========== LOT TYPE ==========
export enum LotType {
  REPRODUCTION = 'reproduction',
  FATTENING = 'fattening',
  WEANING = 'weaning',
  QUARANTINE = 'quarantine',
  SALE = 'sale',
  OTHER = 'other',
}

// ========== MOVEMENT TYPE ==========
export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
  BIRTH = 'birth',
  DEATH = 'death',
  SALE = 'sale',
  PURCHASE = 'purchase',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  TEMPORARY_OUT = 'temporary_out',
  TEMPORARY_RETURN = 'temporary_return',
}

// ========== TEMPORARY MOVEMENT TYPE ==========
export enum TemporaryMovementType {
  VETERINARY = 'veterinary',
  EXHIBITION = 'exhibition',
  BREEDING = 'breeding',
  GRAZING = 'grazing',
  OTHER = 'other',
}

// ========== VACCINATION TYPE ==========
export enum VaccinationType {
  PREVENTIVE = 'preventive',
  CURATIVE = 'curative',
  BOOSTER = 'booster',
}

// ========== WEIGHT SOURCE ==========
export enum WeightSource {
  MANUAL = 'manual',
  SCALE = 'scale',
  ESTIMATED = 'estimated',
}

// ========== BREEDING METHOD ==========
export enum BreedingMethod {
  NATURAL = 'natural',
  ARTIFICIAL_INSEMINATION = 'artificial_insemination',
  EMBRYO_TRANSFER = 'embryo_transfer',
}

// ========== BREEDING STATUS ==========
export enum BreedingStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  ABORTED = 'aborted',
  DELIVERED = 'delivered',
}

// ========== BUYER TYPE ==========
export enum BuyerType {
  INDIVIDUAL = 'individual',
  FARM = 'farm',
  MARKET = 'market',
  SLAUGHTERHOUSE = 'slaughterhouse',
  EXPORT = 'export',
  OTHER = 'other',
}

// ========== TREATMENT STATUS ==========
export enum TreatmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ========== CAMPAIGN STATUS ==========
export enum CampaignStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ========== CAMPAIGN TYPE ==========
export enum CampaignType {
  VACCINATION = 'vaccination',
  DEWORMING = 'deworming',
  SCREENING = 'screening',
  TREATMENT = 'treatment',
  CENSUS = 'census',
  OTHER = 'other',
}

// ========== DOCUMENT TYPE ==========
export enum DocumentType {
  HEALTH_CERTIFICATE = 'health_certificate',
  MOVEMENT_PERMIT = 'movement_permit',
  SALE_INVOICE = 'sale_invoice',
  PURCHASE_INVOICE = 'purchase_invoice',
  VACCINATION_RECORD = 'vaccination_record',
  OTHER = 'other',
}

// ========== ALERT TYPE ==========
export enum AlertType {
  VACCINATION_DUE = 'vaccination_due',
  TREATMENT_DUE = 'treatment_due',
  BREEDING_CHECK = 'breeding_check',
  WEIGHT_CHECK = 'weight_check',
  DOCUMENT_EXPIRY = 'document_expiry',
  LOW_STOCK = 'low_stock',
}

// ========== ALERT PRIORITY ==========
export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ========== SEX ==========
export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

// ========== SYNC STATUS ==========
export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  FAILED = 'failed',
}
