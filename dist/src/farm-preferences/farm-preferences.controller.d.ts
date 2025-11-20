import { FarmPreferencesService } from './farm-preferences.service';
import { UpdateFarmPreferencesDto } from './dto';
export declare class FarmPreferencesController {
    private readonly farmPreferencesService;
    constructor(farmPreferencesService: FarmPreferencesService);
    findOne(farmId: string): Promise<any>;
    update(farmId: string, dto: UpdateFarmPreferencesDto): Promise<any>;
}
