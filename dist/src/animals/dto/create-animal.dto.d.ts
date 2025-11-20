export declare class CreateAnimalDto {
    id: string;
    farmId?: string;
    farm_id?: string;
    get normalizedFarmId(): string;
    currentEid?: string;
    officialNumber?: string;
    visualId?: string;
    birthDate: string;
    sex: string;
    motherId?: string;
    speciesId?: string;
    breedId?: string;
    notes?: string;
}
