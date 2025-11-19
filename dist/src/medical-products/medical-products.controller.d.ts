import { MedicalProductsService } from './medical-products.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
export declare class MedicalProductsController {
    private readonly medicalProductsService;
    constructor(medicalProductsService: MedicalProductsService);
    create(dto: CreateMedicalProductDto): Promise<any>;
    findAll(query: QueryMedicalProductDto): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateMedicalProductDto): Promise<any>;
    remove(id: string): Promise<any>;
}
