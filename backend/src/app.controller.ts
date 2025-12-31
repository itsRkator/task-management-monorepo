/* c8 ignore start - import statements are covered by multiple test imports */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
/* c8 ignore end */

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
