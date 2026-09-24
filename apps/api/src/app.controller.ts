import { Controller, Get } from '@nestjs/common';
@Controller('v1')
export class AppController {
  @Get('health') health(): { status: 'ok'; service: 'tavira-api' } {
    return { status: 'ok', service: 'tavira-api' };
  }
}
