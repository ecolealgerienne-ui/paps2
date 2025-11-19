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
@Controller('vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vaccine' })
  @ApiResponse({ status: 201, description: 'Vaccine created' })
  create(@Body() dto: CreateVaccineDto) {
    return this.vaccinesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaccines' })
  @ApiResponse({ status: 200, description: 'List of vaccines' })
  findAll(@Query() query: QueryVaccineDto) {
    return this.vaccinesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vaccine by ID' })
  @ApiResponse({ status: 200, description: 'Vaccine details' })
  findOne(@Param('id') id: string) {
    return this.vaccinesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vaccine' })
  @ApiResponse({ status: 200, description: 'Vaccine updated' })
  update(@Param('id') id: string, @Body() dto: UpdateVaccineDto) {
    return this.vaccinesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vaccine' })
  @ApiResponse({ status: 200, description: 'Vaccine deleted' })
  remove(@Param('id') id: string) {
    return this.vaccinesService.remove(id);
  }
}
