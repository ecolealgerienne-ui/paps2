import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncPushDto, SyncPullQueryDto } from './dto';
import { SyncPushResponseDto, SyncPullResponseDto } from './dto/sync-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({ summary: 'Push local changes to server' })
  @ApiResponse({
    status: 200,
    description: 'Sync results',
    type: SyncPushResponseDto,
  })
  async pushChanges(@Body() dto: SyncPushDto): Promise<SyncPushResponseDto> {
    return this.syncService.pushChanges(dto);
  }

  @Get('changes')
  @ApiOperation({ summary: 'Pull server changes since last sync' })
  @ApiResponse({
    status: 200,
    description: 'Changes since last sync',
    type: SyncPullResponseDto,
  })
  async pullChanges(@Query() query: SyncPullQueryDto): Promise<SyncPullResponseDto> {
    return this.syncService.pullChanges(query);
  }
}
