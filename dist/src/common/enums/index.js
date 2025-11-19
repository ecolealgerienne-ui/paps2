"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = exports.Sex = exports.AlertPriority = exports.AlertType = exports.DocumentType = exports.CampaignType = exports.CampaignStatus = exports.TreatmentStatus = exports.BuyerType = exports.BreedingStatus = exports.BreedingMethod = exports.WeightSource = exports.VaccinationType = exports.TemporaryMovementType = exports.MovementType = exports.LotType = exports.AnimalStatus = void 0;
var AnimalStatus;
(function (AnimalStatus) {
    AnimalStatus["ALIVE"] = "alive";
    AnimalStatus["SOLD"] = "sold";
    AnimalStatus["DEAD"] = "dead";
    AnimalStatus["SLAUGHTERED"] = "slaughtered";
    AnimalStatus["DRAFT"] = "draft";
})(AnimalStatus || (exports.AnimalStatus = AnimalStatus = {}));
var LotType;
(function (LotType) {
    LotType["REPRODUCTION"] = "reproduction";
    LotType["FATTENING"] = "fattening";
    LotType["WEANING"] = "weaning";
    LotType["QUARANTINE"] = "quarantine";
    LotType["SALE"] = "sale";
    LotType["OTHER"] = "other";
})(LotType || (exports.LotType = LotType = {}));
var MovementType;
(function (MovementType) {
    MovementType["ENTRY"] = "entry";
    MovementType["EXIT"] = "exit";
    MovementType["BIRTH"] = "birth";
    MovementType["DEATH"] = "death";
    MovementType["SALE"] = "sale";
    MovementType["PURCHASE"] = "purchase";
    MovementType["TRANSFER_IN"] = "transfer_in";
    MovementType["TRANSFER_OUT"] = "transfer_out";
    MovementType["TEMPORARY_OUT"] = "temporary_out";
    MovementType["TEMPORARY_RETURN"] = "temporary_return";
})(MovementType || (exports.MovementType = MovementType = {}));
var TemporaryMovementType;
(function (TemporaryMovementType) {
    TemporaryMovementType["VETERINARY"] = "veterinary";
    TemporaryMovementType["EXHIBITION"] = "exhibition";
    TemporaryMovementType["BREEDING"] = "breeding";
    TemporaryMovementType["GRAZING"] = "grazing";
    TemporaryMovementType["OTHER"] = "other";
})(TemporaryMovementType || (exports.TemporaryMovementType = TemporaryMovementType = {}));
var VaccinationType;
(function (VaccinationType) {
    VaccinationType["PREVENTIVE"] = "preventive";
    VaccinationType["CURATIVE"] = "curative";
    VaccinationType["BOOSTER"] = "booster";
})(VaccinationType || (exports.VaccinationType = VaccinationType = {}));
var WeightSource;
(function (WeightSource) {
    WeightSource["MANUAL"] = "manual";
    WeightSource["SCALE"] = "scale";
    WeightSource["ESTIMATED"] = "estimated";
})(WeightSource || (exports.WeightSource = WeightSource = {}));
var BreedingMethod;
(function (BreedingMethod) {
    BreedingMethod["NATURAL"] = "natural";
    BreedingMethod["ARTIFICIAL_INSEMINATION"] = "artificial_insemination";
    BreedingMethod["EMBRYO_TRANSFER"] = "embryo_transfer";
})(BreedingMethod || (exports.BreedingMethod = BreedingMethod = {}));
var BreedingStatus;
(function (BreedingStatus) {
    BreedingStatus["PLANNED"] = "planned";
    BreedingStatus["IN_PROGRESS"] = "in_progress";
    BreedingStatus["CONFIRMED"] = "confirmed";
    BreedingStatus["FAILED"] = "failed";
    BreedingStatus["ABORTED"] = "aborted";
    BreedingStatus["DELIVERED"] = "delivered";
})(BreedingStatus || (exports.BreedingStatus = BreedingStatus = {}));
var BuyerType;
(function (BuyerType) {
    BuyerType["INDIVIDUAL"] = "individual";
    BuyerType["FARM"] = "farm";
    BuyerType["MARKET"] = "market";
    BuyerType["SLAUGHTERHOUSE"] = "slaughterhouse";
    BuyerType["EXPORT"] = "export";
    BuyerType["OTHER"] = "other";
})(BuyerType || (exports.BuyerType = BuyerType = {}));
var TreatmentStatus;
(function (TreatmentStatus) {
    TreatmentStatus["SCHEDULED"] = "scheduled";
    TreatmentStatus["IN_PROGRESS"] = "in_progress";
    TreatmentStatus["COMPLETED"] = "completed";
    TreatmentStatus["CANCELLED"] = "cancelled";
})(TreatmentStatus || (exports.TreatmentStatus = TreatmentStatus = {}));
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["PLANNED"] = "planned";
    CampaignStatus["IN_PROGRESS"] = "in_progress";
    CampaignStatus["COMPLETED"] = "completed";
    CampaignStatus["CANCELLED"] = "cancelled";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var CampaignType;
(function (CampaignType) {
    CampaignType["VACCINATION"] = "vaccination";
    CampaignType["TREATMENT"] = "treatment";
    CampaignType["WEIGHING"] = "weighing";
    CampaignType["IDENTIFICATION"] = "identification";
})(CampaignType || (exports.CampaignType = CampaignType = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["HEALTH_CERTIFICATE"] = "health_certificate";
    DocumentType["MOVEMENT_PERMIT"] = "movement_permit";
    DocumentType["SALE_INVOICE"] = "sale_invoice";
    DocumentType["PURCHASE_INVOICE"] = "purchase_invoice";
    DocumentType["VACCINATION_RECORD"] = "vaccination_record";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var AlertType;
(function (AlertType) {
    AlertType["VACCINATION_DUE"] = "vaccination_due";
    AlertType["TREATMENT_DUE"] = "treatment_due";
    AlertType["BREEDING_CHECK"] = "breeding_check";
    AlertType["WEIGHT_CHECK"] = "weight_check";
    AlertType["DOCUMENT_EXPIRY"] = "document_expiry";
    AlertType["LOW_STOCK"] = "low_stock";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertPriority;
(function (AlertPriority) {
    AlertPriority["LOW"] = "low";
    AlertPriority["MEDIUM"] = "medium";
    AlertPriority["HIGH"] = "high";
    AlertPriority["CRITICAL"] = "critical";
})(AlertPriority || (exports.AlertPriority = AlertPriority = {}));
var Sex;
(function (Sex) {
    Sex["MALE"] = "male";
    Sex["FEMALE"] = "female";
})(Sex || (exports.Sex = Sex = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["SYNCED"] = "synced";
    SyncStatus["CONFLICT"] = "conflict";
    SyncStatus["FAILED"] = "failed";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
//# sourceMappingURL=index.js.map