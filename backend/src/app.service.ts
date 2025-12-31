/* c8 ignore start - import statements are covered by multiple test imports */
import { Injectable } from '@nestjs/common';
/* c8 ignore end */

@Injectable()
export class AppService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
