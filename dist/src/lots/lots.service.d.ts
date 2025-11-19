import { PrismaService } from '../prisma/prisma.service';
import { CreateLotDto, UpdateLotDto, QueryLotDto, AddAnimalsToLotDto } from './dto';
export declare class LotsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateLotDto): Promise<any>;
    findAll(farmId: string, query: QueryLotDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateLotDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
    addAnimals(farmId: string, lotId: string, dto: AddAnimalsToLotDto): Promise<any>;
    removeAnimals(farmId: string, lotId: string, animalIds: string[]): Promise<any>;
}
