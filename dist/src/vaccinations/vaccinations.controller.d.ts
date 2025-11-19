import { VaccinationsService } from './vaccinations.service';
import { CreateVaccinationDto, UpdateVaccinationDto, QueryVaccinationDto } from './dto';
export declare class VaccinationsController {
    private readonly vaccinationsService;
    constructor(vaccinationsService: VaccinationsService);
    create(farmId: string, dto: CreateVaccinationDto): Promise<any>;
    findAll(farmId: string, query: QueryVaccinationDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateVaccinationDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
