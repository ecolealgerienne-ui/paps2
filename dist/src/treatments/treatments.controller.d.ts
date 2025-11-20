import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto, UpdateTreatmentDto, QueryTreatmentDto } from './dto';
export declare class TreatmentsController {
    private readonly treatmentsService;
    constructor(treatmentsService: TreatmentsService);
    create(farmId: string, dto: CreateTreatmentDto): Promise<any>;
    findAll(farmId: string, query: QueryTreatmentDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateTreatmentDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
