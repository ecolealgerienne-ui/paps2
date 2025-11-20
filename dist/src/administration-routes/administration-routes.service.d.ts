import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministrationRouteDto, UpdateAdministrationRouteDto } from './dto';
export declare class AdministrationRoutesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAdministrationRouteDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateAdministrationRouteDto): Promise<any>;
    remove(id: string): Promise<any>;
}
