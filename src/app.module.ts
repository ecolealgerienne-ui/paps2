import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { FeaturesConfigService } from './common/config/features.config';
import { ConditionalThrottlerGuard } from './common/guards/conditional-throttler.guard';
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
import { FarmAlertTemplatePreferencesModule } from './farm-alert-template-preferences/farm-alert-template-preferences.module';
import { FarmBreedPreferencesModule } from './farm-breed-preferences/farm-breed-preferences.module';
import { FarmSpeciesPreferencesModule } from './farm-species-preferences/farm-species-preferences.module';
import { DocumentsModule } from './documents/documents.module';
import { FarmPreferencesModule } from './farm-preferences/farm-preferences.module';
import { FarmProductPreferencesModule } from './farm-product-preferences/farm-product-preferences.module';
import { FarmsModule } from './farms/farms.module';
import { HealthModule } from './health/health.module';
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
import { AnimalStatusModule } from './animal-status/animal-status.module';
import { FarmerProductLotsModule } from './farmer-product-lots/farmer-product-lots.module';
import { TreatmentAlertsModule } from './treatment-alerts/treatment-alerts.module';
import { FarmAlertsModule } from './farm-alerts/farm-alerts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

// Get rate limiting configuration
const rateLimitConfig = FeaturesConfigService.getRateLimitConfig();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting configuration (configurable via .env)
    // Set RATE_LIMIT_ENABLED=false to disable rate limiting (useful for seed scripts)
    // Adjust limits via RATE_LIMIT_*_LIMIT environment variables
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: rateLimitConfig.limits.short.ttl,
        limit: rateLimitConfig.limits.short.limit,
      },
      {
        name: 'medium',
        ttl: rateLimitConfig.limits.medium.ttl,
        limit: rateLimitConfig.limits.medium.limit,
      },
      {
        name: 'long',
        ttl: rateLimitConfig.limits.long.ttl,
        limit: rateLimitConfig.limits.long.limit,
      },
    ]),
    PrismaModule,
    AuthModule,
    // Health checks (liveness/readiness probes)
    HealthModule,
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
    FarmAlertTemplatePreferencesModule,
    FarmBreedPreferencesModule,
    FarmSpeciesPreferencesModule,
    CountriesModule,
    // Farm settings
    FarmsModule,
    AlertConfigurationsModule,
    FarmPreferencesModule,
    FarmProductPreferencesModule,
    SyncModule,
    FarmVeterinarianPreferencesModule,
    FarmNationalCampaignPreferencesModule,
    // Animal status history (physiological states)
    AnimalStatusModule,
    // Farmer product lots (medication batch management)
    FarmerProductLotsModule,
    // Treatment alerts (contraindication, withdrawal, expiry)
    TreatmentAlertsModule,
    // Farm alerts (dynamic alert generation system)
    FarmAlertsModule,
    // Dashboard (unified stats and actions)
    DashboardModule,
    // Reports (bulk data export for PDF/Excel generation)
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ConditionalThrottlerGuard, // Can be disabled with RATE_LIMIT_ENABLED=false
    },
  ],
})
export class AppModule {}
