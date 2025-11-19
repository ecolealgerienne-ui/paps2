import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';
export declare class VeterinariansService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVeterinarianDto): Promise<any>;
    findAll(query: QueryVeterinarianDto): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateVeterinarianDto): Promise<any>;
    remove(id: string): Promise<any>;
}
