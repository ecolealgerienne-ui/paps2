import { MedicalProductsService } from './medical-products.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
export declare class MedicalProductsController {
    private readonly medicalProductsService;
    constructor(medicalProductsService: MedicalProductsService);
    create(farmId: string, dto: CreateMedicalProductDto): Promise<any>;
    findAll(farmId: string, query: QueryMedicalProductDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateMedicalProductDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
