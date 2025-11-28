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
import { AgeCategoriesService } from './age-categories.service';
import { CreateAgeCategoryDto, UpdateAgeCategoryDto, QueryAgeCategoryDto } from './dto';

@ApiTags('Age Categories')
@Controller('age-categories')
export class AgeCategoriesController {
  constructor(private readonly categoriesService: AgeCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an age category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@Body() createDto: CreateAgeCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all age categories' })
  findAll(@Query() query: QueryAgeCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('species/:speciesId')
  @ApiOperation({ summary: 'Get age categories for a species' })
  @ApiParam({ name: 'speciesId', description: 'Species ID (e.g., bovine)' })
  findBySpecies(@Param('speciesId') speciesId: string) {
    return this.categoriesService.findBySpecies(speciesId);
  }

  @Get('match')
  @ApiOperation({ summary: 'Find age category for animal age' })
  @ApiQuery({ name: 'speciesId', required: true })
  @ApiQuery({ name: 'ageInDays', required: true, type: Number })
  findForAnimalAge(
    @Query('speciesId') speciesId: string,
    @Query('ageInDays') ageInDays: number,
  ) {
    return this.categoriesService.findForAnimalAge(speciesId, Number(ageInDays));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an age category' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAgeCategoryDto) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an age category (soft delete)' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
