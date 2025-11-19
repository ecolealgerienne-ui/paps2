import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentDto } from './dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(farmId: string, dto: CreateDocumentDto): Promise<any>;
    findAll(farmId: string, query: QueryDocumentDto): Promise<any>;
    getExpiring(farmId: string, days?: number): Promise<any>;
    getExpired(farmId: string): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateDocumentDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
