import { VaccinesService } from './vaccines.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
export declare class VaccinesController {
    private readonly vaccinesService;
    constructor(vaccinesService: VaccinesService);
    create(dto: CreateVaccineDto): Promise<any>;
    findAll(query: QueryVaccineDto): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateVaccineDto): Promise<any>;
    remove(id: string): Promise<any>;
}
