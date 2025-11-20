import { PrismaService } from '../prisma/prisma.service';
export declare class BreedsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(speciesId?: string): Promise<any>;
}
