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
import { VeterinariansService } from './veterinarians.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('veterinarians')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('farms/:farmId/veterinarians')
export class VeterinariansController {
  constructor(private readonly veterinariansService: VeterinariansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a veterinarian' })
  @ApiResponse({ status: 201, description: 'Veterinarian created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateVeterinarianDto) {
    return this.veterinariansService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all veterinarians' })
  @ApiResponse({ status: 200, description: 'List of veterinarians' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryVeterinarianDto) {
    return this.veterinariansService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a veterinarian by ID' })
  @ApiResponse({ status: 200, description: 'Veterinarian details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.veterinariansService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a veterinarian' })
  @ApiResponse({ status: 200, description: 'Veterinarian updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVeterinarianDto,
  ) {
    return this.veterinariansService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a veterinarian' })
  @ApiResponse({ status: 200, description: 'Veterinarian deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.veterinariansService.remove(farmId, id);
  }
}
