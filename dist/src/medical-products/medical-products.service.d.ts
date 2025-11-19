import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
export declare class MedicalProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateMedicalProductDto): Promise<any>;
    findAll(farmId: string, query: QueryMedicalProductDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateMedicalProductDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
