import { PartialType } from '@nestjs/swagger';
import { CreateFarmerProductLotDto } from './create-farmer-product-lot.dto';

export class UpdateFarmerProductLotDto extends PartialType(CreateFarmerProductLotDto) {}
