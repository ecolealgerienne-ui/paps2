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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { VaccinesService } from './vaccines.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

/**
 * Controller for Vaccines (Master Table Pattern)
 * Supports both global (admin) and local (farm-specific) vaccines
 */
@ApiTags('vaccines')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('farms/:farmId/vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a local vaccine',
    description: 'Creates a new vaccine with scope=local for the specified farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Vaccine created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreateVaccineDto,
  ) {
    return this.vaccinesService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all vaccines',
    description: 'Returns global vaccines + farm local vaccines. Use scope filter to narrow results.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of vaccines with meta information',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query() query: QueryVaccineDto,
  ) {
    return this.vaccinesService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a vaccine by ID',
    description: 'Returns a global vaccine or a local vaccine belonging to this farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Vaccine UUID' })
  @ApiResponse({ status: 200, description: 'Vaccine details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vaccine not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vaccinesService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a vaccine',
    description: 'Updates a local vaccine. Global vaccines are read-only.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Vaccine UUID' })
  @ApiResponse({ status: 200, description: 'Vaccine updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot modify global vaccines' })
  @ApiResponse({ status: 404, description: 'Vaccine not found' })
  @ApiResponse({ status: 409, description: 'Version conflict (optimistic locking)' })
  update(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVaccineDto,
  ) {
    return this.vaccinesService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a vaccine (soft delete)',
    description: 'Soft deletes a local vaccine. Global vaccines cannot be deleted.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Vaccine UUID' })
  @ApiResponse({ status: 200, description: 'Vaccine soft deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot delete global vaccines' })
  @ApiResponse({ status: 404, description: 'Vaccine not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vaccinesService.remove(farmId, id);
  }
}
