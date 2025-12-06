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
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto, UpdateTreatmentDto, QueryTreatmentDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('treatments')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a treatment' })
  @ApiResponse({ status: 201, description: 'Treatment created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateTreatmentDto) {
    return this.treatmentsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all treatments' })
  @ApiResponse({ status: 200, description: 'List of treatments' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryTreatmentDto) {
    return this.treatmentsService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a treatment by ID' })
  @ApiResponse({ status: 200, description: 'Treatment details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.treatmentsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a treatment' })
  @ApiResponse({ status: 200, description: 'Treatment updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentDto,
  ) {
    return this.treatmentsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a treatment (soft delete)' })
  @ApiResponse({ status: 200, description: 'Treatment deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.treatmentsService.remove(farmId, id);
  }
}
