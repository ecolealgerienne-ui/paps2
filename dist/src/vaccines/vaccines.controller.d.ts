import { VaccinesService } from './vaccines.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
export declare class VaccinesController {
    private readonly vaccinesService;
    constructor(vaccinesService: VaccinesService);
    create(farmId: string, dto: CreateVaccineDto): Promise<any>;
    findAll(farmId: string, query: QueryVaccineDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateVaccineDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
