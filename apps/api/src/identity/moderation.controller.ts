import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  auditExportQuerySchema,
  moderationReportQuerySchema,
  moderationReportParameterSchema,
  updateModerationReportSchema,
} from '@tavira/contracts';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { IdentityRepository } from './identity.repository.js';

@Controller('v1/admin')
export class ModerationController {
  constructor(
    @Inject(IdentityRepository) private readonly repository: IdentityRepository,
  ) {}

  @Get('moderation/reports')
  async reports(
    @Headers('x-tavira-admin-key') key: string | undefined,
    @Query() query: unknown,
  ): Promise<unknown> {
    assertAdminKey(key);
    const parsed = moderationReportQuerySchema.safeParse(query);
    if (!parsed.success)
      throw new BadRequestException({ code: 'REQUEST_INVALID' });
    const input = parsed.data;
    return {
      reports: await this.repository.listSafetyReports(
        input.status,
        input.limit,
      ),
    };
  }

  @Patch('moderation/reports/:reportId')
  async updateReport(
    @Headers('x-tavira-admin-key') key: string | undefined,
    @Headers('x-tavira-admin-actor') actor: string | undefined,
    @Param('reportId') reportId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    assertAdminKey(key);
    const parsedParams = moderationReportParameterSchema.safeParse({
      reportId,
    });
    const parsedBody = updateModerationReportSchema.safeParse(body);
    if (!parsedParams.success || !parsedBody.success)
      throw new BadRequestException({ code: 'REQUEST_INVALID' });
    const input = parsedBody.data;
    const report = await this.repository.updateSafetyReportStatus(
      parsedParams.data.reportId,
      input.status,
      input.note,
      actor?.trim().slice(0, 100) || 'internal-admin',
      randomUUID(),
    );
    if (!report) throw new NotFoundException({ code: 'REPORT_NOT_FOUND' });
    return report;
  }

  @Get('audit-events/export')
  async exportAuditEvents(
    @Headers('x-tavira-admin-key') key: string | undefined,
    @Query() query: unknown,
  ): Promise<unknown> {
    assertAdminKey(key);
    const parsed = auditExportQuerySchema.safeParse(query);
    if (!parsed.success)
      throw new BadRequestException({ code: 'REQUEST_INVALID' });
    const input = parsed.data;
    return {
      policy: { retentionDays: 2555, format: 'json', appendOnly: true },
      events: await this.repository.listAuditEvents(
        input.from,
        input.to,
        input.limit,
      ),
    };
  }
}

function assertAdminKey(presented: string | undefined): void {
  const configured = process.env.TAVIRA_ADMIN_API_KEY;
  if (!configured || configured.length < 32 || !presented) {
    throw new UnauthorizedException({ code: 'ADMIN_AUTH_REQUIRED' });
  }
  const expectedHash = createHash('sha256').update(configured).digest();
  const presentedHash = createHash('sha256').update(presented).digest();
  if (!timingSafeEqual(expectedHash, presentedHash)) {
    throw new UnauthorizedException({ code: 'ADMIN_AUTH_INVALID' });
  }
}
