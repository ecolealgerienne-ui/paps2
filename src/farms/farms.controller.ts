import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto, UpdateFarmDto, QueryFarmDto } from './dto';

@ApiTags('Farms')
@Controller('api/farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({ status: 201, description: 'Farm created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.create(createFarmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all farms' })
  @ApiResponse({ status: 200, description: 'List of farms' })
  findAll(@Query() query: QueryFarmDto) {
    return this.farmsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a farm by ID' })
  @ApiParam({ name: 'id', description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm details' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findOne(@Param('id') id: string) {
    return this.farmsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a farm' })
  @ApiParam({ name: 'id', description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmsService.update(id, updateFarmDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a farm' })
  @ApiParam({ name: 'id', description: 'Farm ID' })
  @ApiResponse({ status: 204, description: 'Farm deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  remove(@Param('id') id: string) {
    return this.farmsService.remove(id);
  }
}
