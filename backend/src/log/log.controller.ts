import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.schema';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller({ 
  path: 'logs',
  version: '1'
})
@UseGuards(AuthGuard, RolesGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getLogs(@Query('take') take?: number) {
    return this.logService.getAllLogs(take ?? 10);
  }

  @Post()
  async logAccess(@Body() body: { userId: string }) {
    return this.logService.createLog(body.userId);
  }
}
