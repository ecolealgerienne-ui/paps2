import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors';
import { HttpExceptionFilter } from './common/filters';
import { SecurityConfigService } from './common/config/security.config';
import { LoggingConfigService } from './common/config/logging.config';
import { AppLogger } from './common/utils/logger.service';

async function bootstrap() {
  // ========================================
  // 1. INITIALISATION
  // ========================================
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger('Bootstrap'),
  });

  const logger = new AppLogger('Main');
  const securityConfig = SecurityConfigService.getConfig();
  const loggingConfig = LoggingConfigService.getConfig();

  logger.log('🚀 Starting AniTra API...');

  // ========================================
  // 2. INTERCEPTORS & FILTERS
  // ========================================
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // ========================================
  // 3. VALIDATION
  // ========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ========================================
  // 4. SECURITY - CORS
  // ========================================
  if (securityConfig.cors.enabled) {
    app.enableCors({
      origin: securityConfig.cors.origins,
      credentials: securityConfig.cors.credentials,
    });
    logger.log('✅ CORS enabled');
  }

  // ========================================
  // 5. SECURITY - HELMET (Production uniquement)
  // ========================================
  if (securityConfig.helmet.enabled) {
    app.use(helmet());
    logger.log('✅ Helmet security headers enabled');
  } else {
    logger.warn('⚠️  Helmet disabled (MVP mode)');
  }

  // ========================================
  // 6. SWAGGER API DOCS
  // ========================================
  const config = new DocumentBuilder()
    .setTitle('AniTra API')
    .setDescription("API de gestion d'élevage")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ========================================
  // 7. DÉMARRAGE
  // ========================================
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // ========================================
  // 8. LOGS DE DÉMARRAGE
  // ========================================
  console.log('\n' + '='.repeat(60));
  console.log('🐄 AniTra Backend API');
  console.log('='.repeat(60));
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Mode: ${securityConfig.mvpMode ? 'MVP' : 'PRODUCTION'}`);
  console.log(`📝 Logging: ${loggingConfig.level.toUpperCase()}`);
  console.log(`🚀 API: http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  console.log('='.repeat(60) + '\n');

  logger.audit('API started successfully', {
    port,
    mode: securityConfig.mvpMode ? 'MVP' : 'PRODUCTION',
    logLevel: loggingConfig.level,
  });
}

void bootstrap();
