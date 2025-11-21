import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint - tests full chain (API → Service → DB)' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-11-21T10:30:00.000Z',
        database: 'connected',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Database connection failed',
    schema: {
      example: {
        status: 'error',
        timestamp: '2025-11-21T10:30:00.000Z',
        database: 'disconnected',
      },
    },
  })
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    database: string;
  }> {
    return this.appService.checkHealth();
  }
}
