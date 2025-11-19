import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnimalsModule } from './animals/animals.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AnimalsModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
