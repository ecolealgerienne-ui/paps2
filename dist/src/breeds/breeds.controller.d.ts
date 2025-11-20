import { BreedsService } from './breeds.service';
export declare class BreedsController {
    private readonly breedsService;
    constructor(breedsService: BreedsService);
    findAll(speciesId?: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
