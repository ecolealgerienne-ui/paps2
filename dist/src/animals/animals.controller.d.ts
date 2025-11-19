import { AnimalsService } from './animals.service';
import { CreateAnimalDto, QueryAnimalDto, UpdateAnimalDto } from './dto';
export declare class AnimalsController {
    private readonly animalsService;
    constructor(animalsService: AnimalsService);
    create(farmId: string, createAnimalDto: CreateAnimalDto): Promise<any>;
    findAll(farmId: string, query: QueryAnimalDto): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, updateAnimalDto: UpdateAnimalDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
