import { PrismaService } from '../prisma/prisma.service';
export declare class SpeciesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
}
