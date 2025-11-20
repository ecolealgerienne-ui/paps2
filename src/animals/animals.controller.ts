import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto, QueryAnimalDto, UpdateAnimalDto } from './dto';

@ApiTags('Animals')
@ApiBearerAuth()
@Controller('farms/:farmId/animals')
@UseGuards(AuthGuard, FarmGuard)
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un animal' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  create(
    @Param('farmId') farmId: string,
    @Body() createAnimalDto: CreateAnimalDto,
  ) {
    return this.animalsService.create(farmId, createAnimalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des animaux' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryAnimalDto) {
    return this.animalsService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un animal" })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'id', description: "ID de l'animal" })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.animalsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un animal' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'id', description: "ID de l'animal" })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ) {
    return this.animalsService.update(farmId, id, updateAnimalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un animal (soft delete)' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'id', description: "ID de l'animal" })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.animalsService.remove(farmId, id);
  }
}
