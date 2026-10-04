import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { IdentityController } from './identity.controller.js';
import { IdentityRepository } from './identity.repository.js';
import { IdentityService } from './identity.service.js';
import { PrismaIdentityRepository } from './prisma-identity.repository.js';
import {
  DevelopmentVerificationDelivery,
  VerificationDelivery,
} from './verification-delivery.js';

@Module({
  controllers: [IdentityController],
  providers: [
    IdentityService,
    {
      provide: VerificationDelivery,
      useClass: DevelopmentVerificationDelivery,
    },
    PrismaService,
    PrismaIdentityRepository,
    { provide: IdentityRepository, useExisting: PrismaIdentityRepository },
  ],
  exports: [IdentityService],
})
export class IdentityModule {}
