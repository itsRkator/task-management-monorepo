/* c8 ignore start - import statements are covered by multiple test imports */
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
/* c8 ignore end */

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
