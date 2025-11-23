import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AdministrationRoutesModule } from './administration-routes/administration-routes.module';
import { AlertConfigurationsModule } from './alert-configurations/alert-configurations.module';
import { AnimalsModule } from './animals/animals.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BreedingsModule } from './breedings/breedings.module';
import { BreedsModule } from './breeds/breeds.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CountriesModule } from './countries/countries.module';
import { DocumentsModule } from './documents/documents.module';
import { FarmPreferencesModule } from './farm-preferences/farm-preferences.module';
import { FarmsModule } from './farms/farms.module';
import { GlobalMedicalProductsModule } from './global-medical-products/global-medical-products.module';
import { LotsModule } from './lots/lots.module';
import { MedicalProductsModule } from './medical-products/medical-products.module';
import { MovementsModule } from './movements/movements.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpeciesModule } from './species/species.module';
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
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
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
    SpeciesModule,
    BreedsModule,
    // Global catalog
    GlobalMedicalProductsModule,
    // Farm settings
    FarmsModule,
    AlertConfigurationsModule,
    FarmPreferencesModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
