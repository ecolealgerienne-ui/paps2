import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentDto } from './dto';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateDocumentDto): Promise<any>;
    findAll(farmId: string, query: QueryDocumentDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateDocumentDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
    getExpiringDocuments(farmId: string, days?: number): Promise<any>;
    getExpiredDocuments(farmId: string): Promise<any>;
}
