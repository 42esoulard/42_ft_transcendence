import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiNoContentResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('favicon.ico')
  @ApiNoContentResponse({ description: 'No Content' })
  @HttpCode(204)
  create() {
    return 'No Content';
  }
}
