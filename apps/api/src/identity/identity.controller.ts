import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  loginRequestSchema,
  refreshSessionRequestSchema,
  registerAccountRequestSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  revokeSessionRequestSchema,
  verifyContactRequestSchema,
} from '@tavira/contracts';
import { IdentityError, IdentityService } from './identity.service.js';

@Controller('v1')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Post('identity/register')
  register(@Body() body: unknown): Promise<unknown> {
    return this.execute(() =>
      this.identity.register(registerAccountRequestSchema.parse(body)),
    );
  }

  @Post('identity/verify-contact')
  verifyContact(@Body() body: unknown): Promise<unknown> {
    return this.execute(() =>
      this.identity.verifyContact(verifyContactRequestSchema.parse(body)),
    );
  }

  @Post('identity/login')
  login(@Body() body: unknown): Promise<unknown> {
    return this.execute(() =>
      this.identity.login(loginRequestSchema.parse(body)),
    );
  }

  @Post('identity/refresh')
  refresh(@Body() body: unknown): Promise<unknown> {
    return this.execute(() => {
      const input = refreshSessionRequestSchema.parse(body);
      return this.identity.refresh(input.refreshToken);
    });
  }

  @Post('identity/password-reset/request')
  requestPasswordReset(@Body() body: unknown): Promise<unknown> {
    return this.execute(() => {
      const input = requestPasswordResetSchema.parse(body);
      return this.identity.requestPasswordReset(input.contact);
    });
  }

  @Post('identity/password-reset/confirm')
  resetPassword(@Body() body: unknown): Promise<unknown> {
    return this.execute(async () => {
      await this.identity.resetPassword(resetPasswordSchema.parse(body));
      return { reset: true };
    });
  }

  @Get('identity/sessions')
  sessions(@Headers('authorization') authorization?: string): Promise<unknown> {
    return this.execute(() =>
      this.identity.listSessions(readBearerToken(authorization)),
    );
  }

  @Delete('identity/sessions/:sessionId')
  logoutSession(
    @Headers('authorization') authorization: string | undefined,
    @Param() params: unknown,
  ): Promise<unknown> {
    return this.execute(async () => {
      const { sessionId } = revokeSessionRequestSchema.parse(params);
      await this.identity.logoutSession(
        readBearerToken(authorization),
        sessionId,
      );
      return { revoked: true };
    });
  }

  @Post('identity/logout-all')
  logoutAll(
    @Headers('authorization') authorization?: string,
  ): Promise<unknown> {
    return this.execute(async () => ({
      revokedSessions: await this.identity.logoutAllAuthenticated(
        readBearerToken(authorization),
      ),
    }));
  }

  @Get('profiles/:handle')
  profile(@Param('handle') handle: string): Promise<unknown> {
    return this.execute(() => this.identity.getProfile(handle));
  }

  private async execute<T>(operation: () => T | Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (error instanceof IdentityError) {
        if (
          error.code.includes('ALREADY') ||
          error.code.includes('UNAVAILABLE')
        ) {
          throw new ConflictException({ code: error.code });
        }
        if (
          error.code === 'INVALID_CREDENTIALS' ||
          error.code.includes('TOKEN')
        ) {
          throw new UnauthorizedException({ code: error.code });
        }
        if (error.code === 'PROFILE_NOT_FOUND')
          throw new NotFoundException({ code: error.code });
        throw new BadRequestException({ code: error.code });
      }
      throw new BadRequestException({ code: 'REQUEST_INVALID' });
    }
  }
}

function readBearerToken(authorization?: string): string {
  const [scheme, token] = authorization?.split(' ') ?? [];
  if (scheme?.toLowerCase() !== 'bearer' || !token)
    throw new IdentityError('ACCESS_TOKEN_INVALID');
  return token;
}
