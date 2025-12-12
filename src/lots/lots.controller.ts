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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LotsService } from './lots.service';
import { CreateLotDto, UpdateLotDto, QueryLotDto, AddAnimalsToLotDto, LotStatsQueryDto, LotDetailStatsQueryDto, LotEventsQueryDto, TransferAnimalsDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('lots')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a lot' })
  @ApiResponse({ status: 201, description: 'Lot created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateLotDto) {
    return this.lotsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lots' })
  @ApiResponse({ status: 200, description: 'List of lots' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryLotDto) {
    return this.lotsService.findAll(farmId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get performance statistics for lots' })
  @ApiResponse({ status: 200, description: 'Lot statistics with weights, growth and predictions' })
  getStats(@Param('farmId') farmId: string, @Query() query: LotStatsQueryDto) {
    return this.lotsService.getStats(farmId, query);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer animals between lots' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Animals transferred successfully' })
  @ApiResponse({ status: 404, description: 'Lot or animals not found' })
  @ApiResponse({ status: 409, description: 'Invalid transfer (same lot or animals not in source)' })
  transferAnimals(
    @Param('farmId') farmId: string,
    @Body() dto: TransferAnimalsDto,
  ) {
    return this.lotsService.transferAnimals(farmId, dto);
  }

  @Get(':lotId/animals')
  @ApiOperation({ summary: 'Get all animals in a lot' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'lotId', description: 'ID du lot' })
  @ApiResponse({ status: 200, description: 'Liste des animaux du lot' })
  @ApiResponse({ status: 404, description: 'Lot non trouvé' })
  findAnimals(
    @Param('farmId') farmId: string,
    @Param('lotId') lotId: string,
  ) {
    return this.lotsService.findAnimalsByLotId(farmId, lotId);
  }

  @Get(':lotId/stats')
  @ApiOperation({ summary: 'Get detailed statistics for a single lot' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiParam({ name: 'lotId', description: 'Lot ID' })
  @ApiResponse({ status: 200, description: 'Detailed lot statistics' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  getLotStats(
    @Param('farmId') farmId: string,
    @Param('lotId') lotId: string,
    @Query() query: LotDetailStatsQueryDto,
  ) {
    return this.lotsService.getLotStats(farmId, lotId, query);
  }

  @Get(':lotId/events')
  @ApiOperation({ summary: 'Get timeline events for a lot' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiParam({ name: 'lotId', description: 'Lot ID' })
  @ApiResponse({ status: 200, description: 'Lot events timeline' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  getLotEvents(
    @Param('farmId') farmId: string,
    @Param('lotId') lotId: string,
    @Query() query: LotEventsQueryDto,
  ) {
    return this.lotsService.getLotEvents(farmId, lotId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lot by ID' })
  @ApiResponse({ status: 200, description: 'Lot details with animals' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.lotsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lot' })
  @ApiResponse({ status: 200, description: 'Lot updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLotDto,
  ) {
    return this.lotsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lot (soft delete)' })
  @ApiResponse({ status: 200, description: 'Lot deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.lotsService.remove(farmId, id);
  }

  @Post(':id/animals')
  @ApiOperation({ summary: 'Add animals to lot' })
  @ApiResponse({ status: 200, description: 'Animals added' })
  addAnimals(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: AddAnimalsToLotDto,
  ) {
    return this.lotsService.addAnimals(farmId, id, dto);
  }

  @Delete(':id/animals')
  @ApiOperation({ summary: 'Remove animals from lot' })
  @ApiResponse({ status: 200, description: 'Animals removed' })
  removeAnimals(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: AddAnimalsToLotDto,
  ) {
    return this.lotsService.removeAnimals(farmId, id, dto.animalIds);
  }
}
