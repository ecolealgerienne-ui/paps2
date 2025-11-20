import { PrismaService } from '../prisma/prisma.service';
import { UpdateAlertConfigurationDto, QueryAlertConfigurationDto } from './dto';
export declare class AlertConfigurationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(farmId: string, query: QueryAlertConfigurationDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateAlertConfigurationDto): Promise<any>;
}
