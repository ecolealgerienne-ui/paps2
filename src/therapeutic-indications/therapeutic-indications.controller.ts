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
import { TherapeuticIndicationsService } from './therapeutic-indications.service';
import { CreateTherapeuticIndicationDto, UpdateTherapeuticIndicationDto, QueryTherapeuticIndicationDto } from './dto';

@ApiTags('Therapeutic Indications')
@Controller('therapeutic-indications')
export class TherapeuticIndicationsController {
  constructor(private readonly indicationsService: TherapeuticIndicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a therapeutic indication' })
  @ApiResponse({ status: 201, description: 'Indication created successfully' })
  create(@Body() createDto: CreateTherapeuticIndicationDto) {
    return this.indicationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all indications with filters' })
  findAll(@Query() query: QueryTherapeuticIndicationDto) {
    return this.indicationsService.findAll(query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get indications for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  findByProduct(@Param('productId') productId: string) {
    return this.indicationsService.findByProduct(productId);
  }

  @Get('match')
  @ApiOperation({ summary: 'Find best matching indication for treatment' })
  @ApiQuery({ name: 'productId', required: true })
  @ApiQuery({ name: 'speciesId', required: true })
  @ApiQuery({ name: 'routeId', required: true })
  @ApiQuery({ name: 'countryCode', required: false })
  @ApiQuery({ name: 'ageCategoryId', required: false })
  findForTreatment(
    @Query('productId') productId: string,
    @Query('speciesId') speciesId: string,
    @Query('routeId') routeId: string,
    @Query('countryCode') countryCode?: string,
    @Query('ageCategoryId') ageCategoryId?: string,
  ) {
    return this.indicationsService.findForTreatment(
      productId,
      speciesId,
      routeId,
      countryCode,
      ageCategoryId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get indication by ID' })
  findOne(@Param('id') id: string) {
    return this.indicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an indication' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTherapeuticIndicationDto,
  ) {
    return this.indicationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an indication (soft delete)' })
  remove(@Param('id') id: string) {
    return this.indicationsService.remove(id);
  }
}
