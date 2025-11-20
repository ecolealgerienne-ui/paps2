export declare class UpdateAlertConfigurationDto {
    enabled?: boolean;
    isEnabled?: boolean;
    severity?: number;
    daysBeforeDue?: number;
    priority?: string;
    version?: number;
}
export declare class QueryAlertConfigurationDto {
    type?: string;
    category?: string;
    enabled?: boolean;
}
