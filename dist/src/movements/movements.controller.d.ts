import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementDto, QueryMovementDto } from './dto';
export declare class MovementsController {
    private readonly movementsService;
    constructor(movementsService: MovementsService);
    create(farmId: string, dto: CreateMovementDto): Promise<any>;
    findAll(farmId: string, query: QueryMovementDto): Promise<any>;
    getStatistics(farmId: string, fromDate?: string, toDate?: string): Promise<{
        totalMovements: any;
        byType: Record<string, {
            count: number;
            animalCount: number;
        }>;
        totalSales: number;
        totalPurchases: number;
    }>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateMovementDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
