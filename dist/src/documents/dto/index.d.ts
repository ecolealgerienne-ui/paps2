import { DocumentType } from '../../common/enums';
export declare class CreateDocumentDto {
    id?: string;
    type: DocumentType;
    title: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    fileUrl?: string;
    notes?: string;
}
export declare class UpdateDocumentDto {
    type?: DocumentType;
    title?: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    fileUrl?: string;
    notes?: string;
    version?: number;
}
export declare class QueryDocumentDto {
    type?: DocumentType;
    search?: string;
    expiringSoon?: boolean;
}
