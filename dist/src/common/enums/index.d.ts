export declare enum AnimalStatus {
    ALIVE = "alive",
    SOLD = "sold",
    DEAD = "dead",
    SLAUGHTERED = "slaughtered",
    DRAFT = "draft"
}
export declare enum LotType {
    REPRODUCTION = "reproduction",
    FATTENING = "fattening",
    WEANING = "weaning",
    QUARANTINE = "quarantine",
    SALE = "sale",
    OTHER = "other"
}
export declare enum MovementType {
    ENTRY = "entry",
    EXIT = "exit",
    BIRTH = "birth",
    DEATH = "death",
    SALE = "sale",
    PURCHASE = "purchase",
    TRANSFER_IN = "transfer_in",
    TRANSFER_OUT = "transfer_out",
    TEMPORARY_OUT = "temporary_out",
    TEMPORARY_RETURN = "temporary_return"
}
export declare enum TemporaryMovementType {
    VETERINARY = "veterinary",
    EXHIBITION = "exhibition",
    BREEDING = "breeding",
    GRAZING = "grazing",
    OTHER = "other"
}
export declare enum VaccinationType {
    PREVENTIVE = "preventive",
    CURATIVE = "curative",
    BOOSTER = "booster"
}
export declare enum WeightSource {
    MANUAL = "manual",
    SCALE = "scale",
    ESTIMATED = "estimated"
}
export declare enum BreedingMethod {
    NATURAL = "natural",
    ARTIFICIAL_INSEMINATION = "artificial_insemination",
    EMBRYO_TRANSFER = "embryo_transfer"
}
export declare enum BreedingStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    CONFIRMED = "confirmed",
    FAILED = "failed",
    ABORTED = "aborted",
    DELIVERED = "delivered"
}
export declare enum BuyerType {
    INDIVIDUAL = "individual",
    FARM = "farm",
    MARKET = "market",
    SLAUGHTERHOUSE = "slaughterhouse",
    EXPORT = "export",
    OTHER = "other"
}
export declare enum TreatmentStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum CampaignStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum CampaignType {
    VACCINATION = "vaccination",
    TREATMENT = "treatment",
    WEIGHING = "weighing",
    IDENTIFICATION = "identification"
}
export declare enum DocumentType {
    HEALTH_CERTIFICATE = "health_certificate",
    MOVEMENT_PERMIT = "movement_permit",
    SALE_INVOICE = "sale_invoice",
    PURCHASE_INVOICE = "purchase_invoice",
    VACCINATION_RECORD = "vaccination_record",
    OTHER = "other"
}
export declare enum AlertType {
    VACCINATION_DUE = "vaccination_due",
    TREATMENT_DUE = "treatment_due",
    BREEDING_CHECK = "breeding_check",
    WEIGHT_CHECK = "weight_check",
    DOCUMENT_EXPIRY = "document_expiry",
    LOW_STOCK = "low_stock"
}
export declare enum AlertPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum Sex {
    MALE = "male",
    FEMALE = "female"
}
export declare enum SyncStatus {
    PENDING = "pending",
    SYNCED = "synced",
    CONFLICT = "conflict",
    FAILED = "failed"
}
