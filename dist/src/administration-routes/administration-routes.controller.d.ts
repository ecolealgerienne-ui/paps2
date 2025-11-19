import { AdministrationRoutesService } from './administration-routes.service';
import { CreateAdministrationRouteDto, UpdateAdministrationRouteDto } from './dto';
export declare class AdministrationRoutesController {
    private readonly administrationRoutesService;
    constructor(administrationRoutesService: AdministrationRoutesService);
    create(dto: CreateAdministrationRouteDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateAdministrationRouteDto): Promise<any>;
    remove(id: string): Promise<any>;
}
