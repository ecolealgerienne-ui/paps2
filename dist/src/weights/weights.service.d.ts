import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto } from './dto';
export declare class WeightsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateWeightDto): Promise<any>;
    findAll(farmId: string, query: QueryWeightDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateWeightDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
    getAnimalWeightHistory(farmId: string, animalId: string): Promise<any>;
}
