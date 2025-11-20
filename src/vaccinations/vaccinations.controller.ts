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
import { VaccinationsService } from './vaccinations.service';
import { CreateVaccinationDto, UpdateVaccinationDto, QueryVaccinationDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('vaccinations')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('farms/:farmId/vaccinations')
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vaccination' })
  @ApiResponse({ status: 201, description: 'Vaccination created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateVaccinationDto) {
    return this.vaccinationsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaccinations' })
  @ApiResponse({ status: 200, description: 'List of vaccinations' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryVaccinationDto) {
    return this.vaccinationsService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vaccination by ID' })
  @ApiResponse({ status: 200, description: 'Vaccination details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.vaccinationsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vaccination' })
  @ApiResponse({ status: 200, description: 'Vaccination updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVaccinationDto,
  ) {
    return this.vaccinationsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vaccination (soft delete)' })
  @ApiResponse({ status: 200, description: 'Vaccination deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.vaccinationsService.remove(farmId, id);
  }
}
