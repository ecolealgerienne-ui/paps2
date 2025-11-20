import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmPreferencesDto } from './dto';
export declare class FarmPreferencesService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(farmId: string): Promise<any>;
    update(farmId: string, dto: UpdateFarmPreferencesDto): Promise<any>;
}
