import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { IdentityModule } from './identity/identity.module.js';

@Module({ imports: [IdentityModule], controllers: [AppController] })
export class AppModule {}
