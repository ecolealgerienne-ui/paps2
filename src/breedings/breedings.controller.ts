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
import { BreedingsService } from './breedings.service';
import { CreateBreedingDto, UpdateBreedingDto, QueryBreedingDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('breedings')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/breedings')
export class BreedingsController {
  constructor(private readonly breedingsService: BreedingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a breeding record' })
  @ApiResponse({ status: 201, description: 'Breeding created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateBreedingDto) {
    return this.breedingsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all breedings' })
  @ApiResponse({ status: 200, description: 'List of breedings' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryBreedingDto) {
    return this.breedingsService.findAll(farmId, query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming birth dates' })
  @ApiResponse({ status: 200, description: 'List of upcoming births' })
  getUpcoming(
    @Param('farmId') farmId: string,
    @Query('days') days?: number,
  ) {
    return this.breedingsService.getUpcomingBirthDates(farmId, days || 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a breeding by ID' })
  @ApiResponse({ status: 200, description: 'Breeding details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.breedingsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a breeding' })
  @ApiResponse({ status: 200, description: 'Breeding updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBreedingDto,
  ) {
    return this.breedingsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a breeding (soft delete)' })
  @ApiResponse({ status: 200, description: 'Breeding deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.breedingsService.remove(farmId, id);
  }
}
