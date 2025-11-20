import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdministrationRoutesService } from './administration-routes.service';
import { CreateAdministrationRouteDto, UpdateAdministrationRouteDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('administration-routes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('administration-routes')
export class AdministrationRoutesController {
  constructor(private readonly administrationRoutesService: AdministrationRoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an administration route' })
  @ApiResponse({ status: 201, description: 'Administration route created' })
  create(@Body() dto: CreateAdministrationRouteDto) {
    return this.administrationRoutesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all administration routes' })
  @ApiResponse({ status: 200, description: 'List of administration routes' })
  findAll() {
    return this.administrationRoutesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an administration route by ID' })
  @ApiResponse({ status: 200, description: 'Administration route details' })
  findOne(@Param('id') id: string) {
    return this.administrationRoutesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an administration route' })
  @ApiResponse({ status: 200, description: 'Administration route updated' })
  update(@Param('id') id: string, @Body() dto: UpdateAdministrationRouteDto) {
    return this.administrationRoutesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an administration route' })
  @ApiResponse({ status: 200, description: 'Administration route deleted' })
  remove(@Param('id') id: string) {
    return this.administrationRoutesService.remove(id);
  }
}
