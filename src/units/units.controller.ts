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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, QueryUnitDto } from './dto';
import { UnitType } from '../common/types/prisma-types';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  create(@Body() createDto: CreateUnitDto) {
    return this.unitsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units' })
  findAll(@Query() query: QueryUnitDto) {
    return this.unitsService.findAll(query);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get units by type' })
  @ApiParam({ name: 'type', enum: UnitType })
  findByType(@Param('type') type: string) {
    return this.unitsService.findByType(type);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get unit by code' })
  @ApiParam({ name: 'code', description: 'Unit code (e.g., mg, ml)' })
  findByCode(@Param('code') code: string) {
    return this.unitsService.findByCode(code);
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert value between units' })
  @ApiQuery({ name: 'value', type: Number })
  @ApiQuery({ name: 'from', description: 'Source unit code' })
  @ApiQuery({ name: 'to', description: 'Target unit code' })
  async convert(
    @Query('value') value: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const result = await this.unitsService.convert(Number(value), from, to);
    return { value, from, to, result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  update(@Param('id') id: string, @Body() updateDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a unit (soft delete)' })
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
