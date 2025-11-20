import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto, QueryAnimalDto, UpdateAnimalDto } from './dto';
export declare class AnimalsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateAnimalDto): Promise<any>;
    findAll(farmId: string, query: QueryAnimalDto): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateAnimalDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
