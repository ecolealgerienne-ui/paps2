import { VeterinariansService } from './veterinarians.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';
export declare class VeterinariansController {
    private readonly veterinariansService;
    constructor(veterinariansService: VeterinariansService);
    create(farmId: string, dto: CreateVeterinarianDto): Promise<any>;
    findAll(farmId: string, query: QueryVeterinarianDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateVeterinarianDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
