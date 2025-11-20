"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const administration_routes_module_1 = require("./administration-routes/administration-routes.module");
const alert_configurations_module_1 = require("./alert-configurations/alert-configurations.module");
const animals_module_1 = require("./animals/animals.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const breedings_module_1 = require("./breedings/breedings.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const documents_module_1 = require("./documents/documents.module");
const farm_preferences_module_1 = require("./farm-preferences/farm-preferences.module");
const lots_module_1 = require("./lots/lots.module");
const medical_products_module_1 = require("./medical-products/medical-products.module");
const movements_module_1 = require("./movements/movements.module");
const prisma_module_1 = require("./prisma/prisma.module");
const sync_module_1 = require("./sync/sync.module");
const treatments_module_1 = require("./treatments/treatments.module");
const vaccinations_module_1 = require("./vaccinations/vaccinations.module");
const vaccines_module_1 = require("./vaccines/vaccines.module");
const veterinarians_module_1 = require("./veterinarians/veterinarians.module");
const weights_module_1 = require("./weights/weights.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 20,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            animals_module_1.AnimalsModule,
            lots_module_1.LotsModule,
            treatments_module_1.TreatmentsModule,
            vaccinations_module_1.VaccinationsModule,
            weights_module_1.WeightsModule,
            movements_module_1.MovementsModule,
            breedings_module_1.BreedingsModule,
            campaigns_module_1.CampaignsModule,
            documents_module_1.DocumentsModule,
            veterinarians_module_1.VeterinariansModule,
            medical_products_module_1.MedicalProductsModule,
            vaccines_module_1.VaccinesModule,
            administration_routes_module_1.AdministrationRoutesModule,
            alert_configurations_module_1.AlertConfigurationsModule,
            farm_preferences_module_1.FarmPreferencesModule,
            sync_module_1.SyncModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map