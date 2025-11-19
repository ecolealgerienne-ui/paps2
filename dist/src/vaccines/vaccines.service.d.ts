import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
export declare class VaccinesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVaccineDto): Promise<any>;
    findAll(query: QueryVaccineDto): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateVaccineDto): Promise<any>;
    remove(id: string): Promise<any>;
}
