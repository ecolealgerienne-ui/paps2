import { Module } from '@nestjs/common';
import { AdministrationRoutesController } from './administration-routes.controller';
import { AdministrationRoutesService } from './administration-routes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdministrationRoutesController],
  providers: [AdministrationRoutesService],
  exports: [AdministrationRoutesService],
})
export class AdministrationRoutesModule {}
