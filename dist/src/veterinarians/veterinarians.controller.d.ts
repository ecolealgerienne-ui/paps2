import { VeterinariansService } from './veterinarians.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';
export declare class VeterinariansController {
    private readonly veterinariansService;
    constructor(veterinariansService: VeterinariansService);
    create(dto: CreateVeterinarianDto): Promise<any>;
    findAll(query: QueryVeterinarianDto): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateVeterinarianDto): Promise<any>;
    remove(id: string): Promise<any>;
}
