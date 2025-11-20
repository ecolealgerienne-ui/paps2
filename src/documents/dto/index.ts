import { IsString, IsOptional, IsDateString, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../../common/enums';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Animal ID', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ enum: DocumentType, description: 'Type of document' })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ description: 'Document title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File URL' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsOptional()
  @IsInt()
  fileSizeBytes?: number;

  @ApiProperty({ description: 'MIME type', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ description: 'Upload date' })
  @IsDateString()
  uploadDate: string;

  @ApiProperty({ description: 'Uploaded by user ID', required: false })
  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @ApiProperty({ description: 'Document number', required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'Issue date', required: false })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDocumentDto {
  @ApiProperty({ description: 'Animal ID', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ enum: DocumentType, required: false })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiProperty({ description: 'Document title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'File name', required: false })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({ description: 'File URL', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsOptional()
  @IsInt()
  fileSizeBytes?: number;

  @ApiProperty({ description: 'MIME type', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ description: 'Upload date', required: false })
  @IsOptional()
  @IsDateString()
  uploadDate?: string;

  @ApiProperty({ description: 'Uploaded by user ID', required: false })
  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @ApiProperty({ description: 'Document number', required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'Issue date', required: false })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryDocumentDto {
  @ApiProperty({ enum: DocumentType, required: false })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiProperty({ description: 'Search by title', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Only expiring soon', required: false })
  @IsOptional()
  expiringSoon?: boolean;
}
