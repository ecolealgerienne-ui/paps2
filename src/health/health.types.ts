// src/health/health.types.ts

/**
 * Health Check Response
 *
 * Response for liveness probe (GET /health)
 */
export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
  uptime: string;
  environment: string;
  version: string;
}

/**
 * Readiness Check Response
 *
 * Response for readiness probe (GET /health/ready)
 */
export interface ReadinessCheckResponse {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: DependencyStatus[];
}

/**
 * Dependency Status
 *
 * Status of a single dependency (database, cache, etc.)
 */
export interface DependencyStatus {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime: string;
  error?: string;
}
