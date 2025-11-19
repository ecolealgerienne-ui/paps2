import { WeightsService } from './weights.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto } from './dto';
export declare class WeightsController {
    private readonly weightsService;
    constructor(weightsService: WeightsService);
    create(farmId: string, dto: CreateWeightDto): Promise<any>;
    findAll(farmId: string, query: QueryWeightDto): Promise<any>;
    getAnimalHistory(farmId: string, animalId: string): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateWeightDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
