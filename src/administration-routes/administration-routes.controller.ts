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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdministrationRoutesService } from './administration-routes.service';
import { CreateAdministrationRouteDto, UpdateAdministrationRouteDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Lang } from '../common/decorators';
import { getLocalizedName } from '../common/utils/i18n.helper';

@ApiTags('administration-routes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('administration-routes')
export class AdministrationRoutesController {
  constructor(private readonly administrationRoutesService: AdministrationRoutesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create an administration route',
    description: 'Creates an administration route with name in one language. Use lang field to specify which language.'
  })
  @ApiResponse({ status: 201, description: 'Administration route created' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  async create(@Body() dto: CreateAdministrationRouteDto, @Lang() lang: string) {
    const route = await this.administrationRoutesService.create(dto);
    return {
      id: route.id,
      name: getLocalizedName(route, lang),
      display_order: route.displayOrder,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all administration routes',
    description: 'Returns route names in the requested language only'
  })
  @ApiResponse({ status: 200, description: 'List of administration routes' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  async findAll(@Lang() lang: string) {
    const routes = await this.administrationRoutesService.findAll();
    return routes.map(r => ({
      id: r.id,
      name: getLocalizedName(r, lang),
      display_order: r.displayOrder,
    }));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an administration route by ID',
    description: 'Returns route name in the requested language only'
  })
  @ApiResponse({ status: 200, description: 'Administration route details' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  async findOne(@Param('id') id: string, @Lang() lang: string) {
    const route = await this.administrationRoutesService.findOne(id);
    return {
      id: route.id,
      name: getLocalizedName(route, lang),
      display_order: route.displayOrder,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an administration route',
    description: 'Update route name in one language. Provide name and lang fields to update a specific language.'
  })
  @ApiResponse({ status: 200, description: 'Administration route updated' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  async update(@Param('id') id: string, @Body() dto: UpdateAdministrationRouteDto, @Lang() lang: string) {
    const route = await this.administrationRoutesService.update(id, dto);
    return {
      id: route.id,
      name: getLocalizedName(route, lang),
      display_order: route.displayOrder,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an administration route' })
  @ApiResponse({ status: 200, description: 'Administration route deleted' })
  remove(@Param('id') id: string) {
    return this.administrationRoutesService.remove(id);
  }
}
