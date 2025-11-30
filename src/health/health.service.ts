// src/health/health.service.ts

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';
import {
  HealthCheckResponse,
  ReadinessCheckResponse,
  DependencyStatus,
} from './health.types';

/**
 * Health Service
 *
 * Performs health checks on the application and its dependencies.
 */
@Injectable()
export class HealthService {
  private readonly logger = new AppLogger('HealthService');
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness Check
   *
   * Simple check to verify the application is running.
   * Always returns healthy unless the app crashes.
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${uptime}s`,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0', // TODO: Get from package.json
    };
  }

  /**
   * Readiness Check
   *
   * Checks if the application is ready to serve traffic.
   * Verifies all critical dependencies are healthy.
   *
   * @throws ServiceUnavailableException if any dependency is unhealthy
   */
  async checkReadiness(): Promise<ReadinessCheckResponse> {
    const checks: DependencyStatus[] = [];

    // Check database connection
    const dbStatus = await this.checkDatabase();
    checks.push(dbStatus);

    // Determine overall status
    const allHealthy = checks.every((check) => check.status === 'healthy');
    const overallStatus = allHealthy ? 'ready' : 'not_ready';

    const response: ReadinessCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    };

    // If not ready, throw 503 Service Unavailable
    if (!allHealthy) {
      this.logger.warn('Readiness check failed', response);
      throw new ServiceUnavailableException(response);
    }

    return response;
  }

  /**
   * Check Database Connection
   *
   * Verifies that the database is accessible and responsive.
   */
  private async checkDatabase(): Promise<DependencyStatus> {
    const startTime = Date.now();

    try {
      // Simple query to check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      const duration = Date.now() - startTime;

      return {
        name: 'database',
        status: 'healthy',
        responseTime: `${duration}ms`,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.warn('Database health check failed', {
        error: error.message,
        responseTime: `${duration}ms`,
      });

      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: `${duration}ms`,
        error: error.message,
      };
    }
  }
}
