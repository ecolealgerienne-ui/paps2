import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto, UpdateMovementDto, QueryMovementDto } from './dto';
export declare class MovementsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateMovementDto): Promise<any>;
    private getStatusUpdate;
    findAll(farmId: string, query: QueryMovementDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateMovementDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
    getStatistics(farmId: string, fromDate?: string, toDate?: string): Promise<{
        totalMovements: any;
        byType: Record<string, {
            count: number;
            animalCount: number;
        }>;
        totalSales: number;
        totalPurchases: number;
    }>;
}
