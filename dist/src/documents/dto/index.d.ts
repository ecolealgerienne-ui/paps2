import { DocumentType } from '../../common/enums';
export declare class CreateDocumentDto {
    id?: string;
    animalId?: string;
    type: DocumentType;
    title?: string;
    fileName: string;
    fileUrl: string;
    fileSizeBytes?: number;
    mimeType?: string;
    uploadDate: string;
    uploadedBy?: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    notes?: string;
}
export declare class UpdateDocumentDto {
    animalId?: string;
    type?: DocumentType;
    title?: string;
    fileName?: string;
    fileUrl?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    uploadDate?: string;
    uploadedBy?: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    notes?: string;
    version?: number;
}
export declare class QueryDocumentDto {
    type?: DocumentType;
    search?: string;
    expiringSoon?: boolean;
}
