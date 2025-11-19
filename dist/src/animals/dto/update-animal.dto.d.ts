import { CreateAnimalDto } from './create-animal.dto';
declare const UpdateAnimalDto_base: import("@nestjs/common").Type<Partial<CreateAnimalDto>>;
export declare class UpdateAnimalDto extends UpdateAnimalDto_base {
    version?: number;
}
export {};
