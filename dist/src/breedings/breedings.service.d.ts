import { PrismaService } from '../prisma/prisma.service';
import { CreateBreedingDto, UpdateBreedingDto, QueryBreedingDto } from './dto';
export declare class BreedingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateBreedingDto): Promise<any>;
    findAll(farmId: string, query: QueryBreedingDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateBreedingDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
    getUpcomingDueDates(farmId: string, days?: number): Promise<any>;
}
