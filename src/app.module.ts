import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdministrationRoutesModule } from './administration-routes/administration-routes.module';
import { AnimalsModule } from './animals/animals.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BreedingsModule } from './breedings/breedings.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DocumentsModule } from './documents/documents.module';
import { LotsModule } from './lots/lots.module';
import { MedicalProductsModule } from './medical-products/medical-products.module';
import { MovementsModule } from './movements/movements.module';
import { PrismaModule } from './prisma/prisma.module';
import { SyncModule } from './sync/sync.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { VaccinesModule } from './vaccines/vaccines.module';
import { VeterinariansModule } from './veterinarians/veterinarians.module';
import { WeightsModule } from './weights/weights.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AnimalsModule,
    LotsModule,
    TreatmentsModule,
    VaccinationsModule,
    WeightsModule,
    MovementsModule,
    BreedingsModule,
    CampaignsModule,
    DocumentsModule,
    // Reference tables (admin)
    VeterinariansModule,
    MedicalProductsModule,
    VaccinesModule,
    AdministrationRoutesModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
