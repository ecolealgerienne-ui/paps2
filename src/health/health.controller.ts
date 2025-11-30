// src/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthCheckResponse, ReadinessCheckResponse } from './health.types';

/**
 * Health Check Controller
 *
 * Provides endpoints for application health monitoring.
 * Used by Kubernetes, load balancers, and monitoring systems.
 *
 * Endpoints:
 * - GET /health - Liveness probe (is the app running?)
 * - GET /health/ready - Readiness probe (is the app ready to serve traffic?)
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Liveness Probe
   *
   * Simple endpoint to check if the application is alive.
   * Returns 200 if the app is running.
   *
   * Used by Kubernetes liveness probe to detect if the app needs to be restarted.
   */
  @Get()
  @ApiOperation({ summary: 'Liveness check - is the app running?' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.healthService.checkHealth();
  }

  /**
   * Readiness Probe
   *
   * Checks if the application is ready to serve traffic.
   * Verifies critical dependencies (database, etc.)
   *
   * Returns:
   * - 200 if app is ready (all dependencies healthy)
   * - 503 if app is not ready (database down, etc.)
   *
   * Used by Kubernetes readiness probe to control traffic routing.
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check - is the app ready to serve traffic?' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready (dependencies unhealthy)' })
  async checkReadiness(): Promise<ReadinessCheckResponse> {
    return this.healthService.checkReadiness();
  }
}
