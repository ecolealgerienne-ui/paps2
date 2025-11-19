import { Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { FarmGuard } from './guards/farm.guard';

@Module({
  providers: [AuthGuard, FarmGuard],
  exports: [AuthGuard, FarmGuard],
})
export class AuthModule {}
