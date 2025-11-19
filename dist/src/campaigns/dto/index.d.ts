import { CampaignType, CampaignStatus } from '../../common/enums';
export declare class CreateCampaignDto {
    id?: string;
    name: string;
    type: CampaignType;
    lotId?: string;
    startDate: string;
    endDate?: string;
    targetCount?: number;
    status?: CampaignStatus;
    notes?: string;
}
export declare class UpdateCampaignDto {
    name?: string;
    type?: CampaignType;
    lotId?: string;
    startDate?: string;
    endDate?: string;
    targetCount?: number;
    completedCount?: number;
    status?: CampaignStatus;
    notes?: string;
    version?: number;
}
export declare class QueryCampaignDto {
    type?: CampaignType;
    status?: CampaignStatus;
    fromDate?: string;
    toDate?: string;
}
