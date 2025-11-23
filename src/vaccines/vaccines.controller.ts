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
import { VaccinesService } from './vaccines.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

/**
 * Controller for Custom Vaccines (PHASE_10)
 */
@ApiTags('Custom Vaccines')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('farms/:farmId/vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a custom vaccine (PHASE_10)' })
  @ApiResponse({ status: 201, description: 'Custom vaccine created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateVaccineDto) {
    return this.vaccinesService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all custom vaccines for a farm (PHASE_10)' })
  @ApiResponse({ status: 200, description: 'List of custom vaccines' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryVaccineDto) {
    return this.vaccinesService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a custom vaccine by ID (PHASE_10)' })
  @ApiResponse({ status: 200, description: 'Custom vaccine details' })
  @ApiResponse({ status: 404, description: 'Custom vaccine not found' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.vaccinesService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a custom vaccine (PHASE_10)' })
  @ApiResponse({ status: 200, description: 'Custom vaccine updated successfully' })
  @ApiResponse({ status: 404, description: 'Custom vaccine not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch (optimistic locking)' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVaccineDto,
  ) {
    return this.vaccinesService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a custom vaccine (PHASE_10)' })
  @ApiResponse({ status: 200, description: 'Custom vaccine soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Custom vaccine not found' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.vaccinesService.remove(farmId, id);
  }
}
