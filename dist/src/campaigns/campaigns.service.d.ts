import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto } from './dto';
export declare class CampaignsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(farmId: string, dto: CreateCampaignDto): Promise<any>;
    findAll(farmId: string, query: QueryCampaignDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateCampaignDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
    getActiveCampaigns(farmId: string): Promise<any>;
    getCampaignProgress(farmId: string, id: string): Promise<{
        campaign: any;
        progress: {
            targetCount: any;
            completedCount: any;
            vaccinationsCount: any;
            progressPercent: number;
        };
    }>;
}
