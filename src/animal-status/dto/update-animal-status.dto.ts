import { PartialType } from '@nestjs/swagger';
import { CreateAnimalStatusDto } from './create-animal-status.dto';

export class UpdateAnimalStatusDto extends PartialType(CreateAnimalStatusDto) {}
