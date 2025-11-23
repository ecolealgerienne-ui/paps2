import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VaccinesGlobalService } from './vaccines-global.service';
import {
  CreateVaccineGlobalDto,
  VaccineTargetDisease,
} from './dto/create-vaccine-global.dto';
import { UpdateVaccineGlobalDto } from './dto/update-vaccine-global.dto';

/**
 * Controller pour la gestion des vaccins globaux
 * PHASE_06: Référentiel international des vaccins
 */
@ApiTags('vaccines-global')
@Controller('vaccines-global')
export class VaccinesGlobalController {
  constructor(private readonly vaccinesService: VaccinesGlobalService) {}

  /**
   * Créer un nouveau vaccin
   */
  @Post()
  @ApiOperation({ summary: 'Create a new vaccine' })
  @ApiResponse({
    status: 201,
    description: 'Vaccine successfully created',
  })
  @ApiResponse({
    status: 409,
    description: 'Vaccine with this code already exists',
  })
  async create(@Body() createDto: CreateVaccineGlobalDto) {
    const vaccine = await this.vaccinesService.create(createDto);
    return {
      success: true,
      data: vaccine,
    };
  }

  /**
   * Récupérer la liste des maladies cibles
   */
  @Get('diseases')
  @ApiOperation({ summary: 'Get list of target diseases' })
  @ApiResponse({
    status: 200,
    description: 'List of target diseases returned',
  })
  async getTargetDiseases() {
    const diseases = await this.vaccinesService.getTargetDiseases();
    return {
      success: true,
      data: diseases,
    };
  }

  /**
   * Récupérer les vaccins par maladie cible
   */
  @Get('disease/:disease')
  @ApiOperation({ summary: 'Get vaccines by target disease' })
  @ApiParam({
    name: 'disease',
    description: 'Target disease',
    enum: VaccineTargetDisease,
    example: VaccineTargetDisease.BRUCELLOSIS,
  })
  @ApiResponse({
    status: 200,
    description: 'Vaccines for the specified disease',
  })
  async findByDisease(@Param('disease') disease: VaccineTargetDisease) {
    const vaccines = await this.vaccinesService.findByTargetDisease(disease);
    return {
      success: true,
      data: vaccines,
    };
  }

  /**
   * Récupérer tous les vaccins avec filtres optionnels
   */
  @Get()
  @ApiOperation({ summary: 'Get all vaccines with optional filters' })
  @ApiQuery({
    name: 'targetDisease',
    required: false,
    description: 'Filter by target disease',
    enum: VaccineTargetDisease,
    example: VaccineTargetDisease.BRUCELLOSIS,
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    description: 'Include soft deleted vaccines',
    type: Boolean,
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of vaccines',
  })
  async findAll(
    @Query('targetDisease') targetDisease?: VaccineTargetDisease,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const includeDeletedBool = includeDeleted === 'true';
    const vaccines = await this.vaccinesService.findAll({
      targetDisease,
      includeDeleted: includeDeletedBool,
    });
    return {
      success: true,
      data: vaccines,
    };
  }

  /**
   * Récupérer un vaccin par ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a vaccine by ID' })
  @ApiParam({
    name: 'id',
    description: 'Vaccine UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaccine found',
  })
  @ApiResponse({
    status: 404,
    description: 'Vaccine not found',
  })
  async findOne(@Param('id') id: string) {
    const vaccine = await this.vaccinesService.findOne(id);
    return {
      success: true,
      data: vaccine,
    };
  }

  /**
   * Mettre à jour un vaccin
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a vaccine' })
  @ApiParam({
    name: 'id',
    description: 'Vaccine UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'version',
    required: false,
    description: 'Current version for optimistic locking',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vaccine successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Vaccine not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Version conflict (optimistic locking)',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateVaccineGlobalDto,
    @Query('version') version?: string,
  ) {
    const currentVersion = version ? parseInt(version, 10) : undefined;
    const vaccine = await this.vaccinesService.update(
      id,
      updateDto,
      currentVersion,
    );
    return {
      success: true,
      data: vaccine,
    };
  }

  /**
   * Supprimer un vaccin (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a vaccine (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Vaccine UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaccine successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Vaccine not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Vaccine is used in relations and cannot be deleted',
  })
  async remove(@Param('id') id: string) {
    const vaccine = await this.vaccinesService.remove(id);
    return {
      success: true,
      data: vaccine,
      message: `Vaccine "${vaccine.code}" successfully deleted`,
    };
  }

  /**
   * Restaurer un vaccin soft deleted
   */
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft deleted vaccine' })
  @ApiParam({
    name: 'id',
    description: 'Vaccine UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaccine successfully restored',
  })
  @ApiResponse({
    status: 404,
    description: 'Vaccine not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Vaccine is not deleted',
  })
  async restore(@Param('id') id: string) {
    const vaccine = await this.vaccinesService.restore(id);
    return {
      success: true,
      data: vaccine,
      message: `Vaccine "${vaccine.code}" successfully restored`,
    };
  }
}
