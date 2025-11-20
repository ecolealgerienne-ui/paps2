import { LotsService } from './lots.service';
import { CreateLotDto, UpdateLotDto, QueryLotDto, AddAnimalsToLotDto } from './dto';
export declare class LotsController {
    private readonly lotsService;
    constructor(lotsService: LotsService);
    create(farmId: string, dto: CreateLotDto): Promise<any>;
    findAll(farmId: string, query: QueryLotDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateLotDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
    addAnimals(farmId: string, id: string, dto: AddAnimalsToLotDto): Promise<any>;
    removeAnimals(farmId: string, id: string, dto: AddAnimalsToLotDto): Promise<any>;
}
