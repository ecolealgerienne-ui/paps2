import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a document' })
  @ApiResponse({ status: 201, description: 'Document created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryDocumentDto) {
    return this.documentsService.findAll(farmId, query);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring documents' })
  @ApiResponse({ status: 200, description: 'List of expiring documents' })
  getExpiring(
    @Param('farmId') farmId: string,
    @Query('days') days?: number,
  ) {
    return this.documentsService.getExpiringDocuments(farmId, days || 30);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired documents' })
  @ApiResponse({ status: 200, description: 'List of expired documents' })
  getExpired(@Param('farmId') farmId: string) {
    return this.documentsService.getExpiredDocuments(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.documentsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({ status: 200, description: 'Document updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document (soft delete)' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.documentsService.remove(farmId, id);
  }
}
