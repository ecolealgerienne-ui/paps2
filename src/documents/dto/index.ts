import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../../common/enums';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: DocumentType, description: 'Type of document' })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ description: 'Document title' })
  @IsString()
  title: string;

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

  @ApiProperty({ description: 'File URL', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDocumentDto {
  @ApiProperty({ enum: DocumentType, required: false })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiProperty({ description: 'Document title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

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

  @ApiProperty({ description: 'File URL', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

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
