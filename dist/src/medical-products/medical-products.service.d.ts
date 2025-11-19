import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
export declare class MedicalProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMedicalProductDto): Promise<any>;
    findAll(query: QueryMedicalProductDto): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateMedicalProductDto): Promise<any>;
    remove(id: string): Promise<any>;
}
