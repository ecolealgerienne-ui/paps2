import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AnimalStatusService } from './animal-status.service';
import {
  CreateAnimalStatusDto,
  UpdateAnimalStatusDto,
  QueryAnimalStatusDto,
  CloseAnimalStatusDto,
} from './dto';

@ApiTags('animal-status')
@Controller('farms/:farmId/animals/:animalId/status-history')
export class AnimalStatusController {
  constructor(private readonly service: AnimalStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un statut physiologique pour un animal' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiResponse({ status: 201, description: 'Status created' })
  @ApiResponse({ status: 404, description: 'Animal not found' })
  @ApiResponse({ status: 409, description: 'Active status of same type already exists' })
  create(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Body() dto: CreateAnimalStatusDto,
  ) {
    return this.service.create(farmId, animalId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste paginée des statuts d\'un animal' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiResponse({ status: 200, description: 'Paginated list of statuses' })
  @ApiResponse({ status: 404, description: 'Animal not found' })
  findAll(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Query() query: QueryAnimalStatusDto,
  ) {
    return this.service.findAll(farmId, animalId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer tous les statuts actifs d\'un animal' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiResponse({ status: 200, description: 'List of active statuses' })
  @ApiResponse({ status: 404, description: 'Animal not found' })
  findActive(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
  ) {
    return this.service.findActive(farmId, animalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un statut par ID' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiParam({ name: 'id', description: 'Status UUID' })
  @ApiResponse({ status: 200, description: 'Status details' })
  @ApiResponse({ status: 404, description: 'Status not found' })
  findOne(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(farmId, animalId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un statut' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiParam({ name: 'id', description: 'Status UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Status not found' })
  update(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAnimalStatusDto,
  ) {
    return this.service.update(farmId, animalId, id, dto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Clôturer un statut actif' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiParam({ name: 'id', description: 'Status UUID' })
  @ApiResponse({ status: 200, description: 'Status closed' })
  @ApiResponse({ status: 400, description: 'Status already closed or invalid date' })
  @ApiResponse({ status: 404, description: 'Status not found' })
  close(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Param('id') id: string,
    @Body() dto: CloseAnimalStatusDto,
  ) {
    return this.service.close(farmId, animalId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un statut (soft delete)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiParam({ name: 'id', description: 'Status UUID' })
  @ApiResponse({ status: 200, description: 'Status deleted' })
  @ApiResponse({ status: 404, description: 'Status not found' })
  remove(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(farmId, animalId, id);
  }
}
