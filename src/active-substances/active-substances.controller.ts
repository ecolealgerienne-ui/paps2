import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ActiveSubstancesService } from './active-substances.service';
import { CreateActiveSubstanceDto, UpdateActiveSubstanceDto, QueryActiveSubstanceDto } from './dto';

@ApiTags('Active Substances')
@Controller('active-substances')
export class ActiveSubstancesController {
  constructor(private readonly substancesService: ActiveSubstancesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an active substance' })
  @ApiResponse({ status: 201, description: 'Substance created successfully' })
  create(@Body() createDto: CreateActiveSubstanceDto) {
    return this.substancesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active substances' })
  findAll(@Query() query: QueryActiveSubstanceDto) {
    return this.substancesService.findAll(query);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get substance by code' })
  @ApiParam({ name: 'code', description: 'Substance code (e.g., amoxicillin)' })
  findByCode(@Param('code') code: string) {
    return this.substancesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get substance by ID' })
  findOne(@Param('id') id: string) {
    return this.substancesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a substance' })
  update(@Param('id') id: string, @Body() updateDto: UpdateActiveSubstanceDto) {
    return this.substancesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a substance (soft delete)' })
  remove(@Param('id') id: string) {
    return this.substancesService.remove(id);
  }
}
