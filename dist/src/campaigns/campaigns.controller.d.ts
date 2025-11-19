import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto } from './dto';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    create(farmId: string, dto: CreateCampaignDto): Promise<any>;
    findAll(farmId: string, query: QueryCampaignDto): Promise<any>;
    getActive(farmId: string): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    getProgress(farmId: string, id: string): Promise<{
        campaign: any;
        progress: {
            targetCount: any;
            completedCount: any;
            progressPercent: number;
        };
    }>;
    update(farmId: string, id: string, dto: UpdateCampaignDto): Promise<any>;
    remove(farmId: string, id: string): Promise<any>;
}
