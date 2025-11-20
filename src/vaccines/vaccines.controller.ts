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

@ApiTags('vaccines')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('farms/:farmId/vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vaccine' })
  @ApiResponse({ status: 201, description: 'Vaccine created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateVaccineDto) {
    return this.vaccinesService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaccines' })
  @ApiResponse({ status: 200, description: 'List of vaccines' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryVaccineDto) {
    return this.vaccinesService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vaccine by ID' })
  @ApiResponse({ status: 200, description: 'Vaccine details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.vaccinesService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vaccine' })
  @ApiResponse({ status: 200, description: 'Vaccine updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVaccineDto,
  ) {
    return this.vaccinesService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vaccine' })
  @ApiResponse({ status: 200, description: 'Vaccine deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.vaccinesService.remove(farmId, id);
  }
}
