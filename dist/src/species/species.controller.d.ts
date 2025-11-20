import { SpeciesService } from './species.service';
export declare class SpeciesController {
    private readonly speciesService;
    constructor(speciesService: SpeciesService);
    findAll(): Promise<{
        success: boolean;
        data: any;
    }>;
}
