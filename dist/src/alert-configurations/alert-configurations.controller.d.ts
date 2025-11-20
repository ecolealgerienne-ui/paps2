import { AlertConfigurationsService } from './alert-configurations.service';
import { UpdateAlertConfigurationDto, QueryAlertConfigurationDto } from './dto';
export declare class AlertConfigurationsController {
    private readonly alertConfigurationsService;
    constructor(alertConfigurationsService: AlertConfigurationsService);
    findAll(farmId: string, query: QueryAlertConfigurationDto): Promise<any>;
    findOne(farmId: string, id: string): Promise<any>;
    update(farmId: string, id: string, dto: UpdateAlertConfigurationDto): Promise<any>;
}
