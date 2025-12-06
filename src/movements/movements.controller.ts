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
import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementDto, QueryMovementDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('movements')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a movement (entry/exit/sale/etc.)' })
  @ApiResponse({ status: 201, description: 'Movement created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateMovementDto) {
    return this.movementsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all movements' })
  @ApiResponse({ status: 200, description: 'List of movements' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryMovementDto) {
    return this.movementsService.findAll(farmId, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get movement statistics' })
  @ApiResponse({ status: 200, description: 'Movement statistics' })
  getStatistics(
    @Param('farmId') farmId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.movementsService.getStatistics(farmId, fromDate, toDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a movement by ID' })
  @ApiResponse({ status: 200, description: 'Movement details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.movementsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a movement' })
  @ApiResponse({ status: 200, description: 'Movement updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMovementDto,
  ) {
    return this.movementsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a movement (soft delete)' })
  @ApiResponse({ status: 200, description: 'Movement deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.movementsService.remove(farmId, id);
  }
}
