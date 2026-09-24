import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller.js';
import {
  DevelopmentVerificationDelivery,
  IdentityService,
} from './identity.service.js';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, DevelopmentVerificationDelivery],
  exports: [IdentityService],
})
export class IdentityModule {}
