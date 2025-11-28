import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AdministrationRoutesModule } from './administration-routes/administration-routes.module';
import { AlertConfigurationsModule } from './alert-configurations/alert-configurations.module';
import { AlertTemplatesModule } from './alert-templates/alert-templates.module';
import { AnimalsModule } from './animals/animals.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BreedingsModule } from './breedings/breedings.module';
import { BreedsModule } from './breeds/breeds.module';
import { BreedCountriesModule } from './breed-countries/breed-countries.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CampaignCountriesModule } from './campaign-countries/campaign-countries.module';
import { CountriesModule } from './countries/countries.module';
import { FarmBreedPreferencesModule } from './farm-breed-preferences/farm-breed-preferences.module';
import { DocumentsModule } from './documents/documents.module';
import { FarmPreferencesModule } from './farm-preferences/farm-preferences.module';
import { FarmProductPreferencesModule } from './farm-product-preferences/farm-product-preferences.module';
import { FarmsModule } from './farms/farms.module';
import { LotsModule } from './lots/lots.module';
import { MovementsModule } from './movements/movements.module';
import { NationalCampaignsModule } from './national-campaigns/national-campaigns.module';
import { PersonalCampaignsModule } from './personal-campaigns/personal-campaigns.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ProductPackagingsModule } from './product-packagings/product-packagings.module';
import { SpeciesModule } from './species/species.module';
import { SyncModule } from './sync/sync.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { VeterinariansModule } from './veterinarians/veterinarians.module';
import { WeightsModule } from './weights/weights.module';
import { FarmVeterinarianPreferencesModule } from './farm-veterinarian-preferences/farm-veterinarian-preferences.module';
import { FarmNationalCampaignPreferencesModule } from './farm-national-campaign-preferences/farm-national-campaign-preferences.module';
import { UnitsModule } from './units/units.module';
import { TherapeuticIndicationsModule } from './therapeutic-indications/therapeutic-indications.module';
import { ActiveSubstancesModule } from './active-substances/active-substances.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { AgeCategoriesModule } from './age-categories/age-categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting configuration
    // In development/MVP mode: very high limits for seed scripts
    // In production: reasonable limits to prevent abuse
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: process.env.NODE_ENV === 'production' ? 50 : 1000, // High limit for dev/seed
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: process.env.NODE_ENV === 'production' ? 200 : 5000, // High limit for dev/seed
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: process.env.NODE_ENV === 'production' ? 500 : 30000, // High limit for dev/seed
      },
    ]),
    PrismaModule,
    AuthModule,
    AnimalsModule,
    LotsModule,
    TreatmentsModule,
    WeightsModule,
    MovementsModule,
    BreedingsModule,
    PersonalCampaignsModule,
    DocumentsModule,
    // Reference tables (admin)
    VeterinariansModule,
    ProductsModule,
    ProductPackagingsModule,
    UnitsModule,
    TherapeuticIndicationsModule,
    ActiveSubstancesModule,
    ProductCategoriesModule,
    AgeCategoriesModule,
    NationalCampaignsModule,
    AlertTemplatesModule,
    AdministrationRoutesModule,
    SpeciesModule,
    BreedsModule,
    BreedCountriesModule,
    CampaignCountriesModule,
    FarmBreedPreferencesModule,
    CountriesModule,
    // Farm settings
    FarmsModule,
    AlertConfigurationsModule,
    FarmPreferencesModule,
    FarmProductPreferencesModule,
    SyncModule,
    FarmVeterinarianPreferencesModule,
    FarmNationalCampaignPreferencesModule,
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
