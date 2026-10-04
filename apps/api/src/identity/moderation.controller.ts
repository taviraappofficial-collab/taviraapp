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
} from '@nestjs/common';
import {
  auditExportQuerySchema,
  moderationReportQuerySchema,
  moderationReportParameterSchema,
  updateModerationReportSchema,
} from '@tavira/contracts';
import { randomUUID } from 'node:crypto';
import { IdentityRepository } from './identity.repository.js';
import { WorkforceAuthenticator } from './workforce-auth.js';

@Controller('v1/admin')
export class ModerationController {
  constructor(
    @Inject(IdentityRepository) private readonly repository: IdentityRepository,
    @Inject(WorkforceAuthenticator)
    private readonly workforce: WorkforceAuthenticator,
  ) {}

  @Get('moderation/reports')
  async reports(
    @Headers('authorization') authorization: string | undefined,
    @Query() query: unknown,
  ): Promise<unknown> {
    await this.workforce.authorize(authorization, 'Tavira.Moderator');
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
    @Headers('authorization') authorization: string | undefined,
    @Param('reportId') reportId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    const principal = await this.workforce.authorize(
      authorization,
      'Tavira.Moderator',
    );
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
      principal.id,
      randomUUID(),
    );
    if (!report) throw new NotFoundException({ code: 'REPORT_NOT_FOUND' });
    return report;
  }

  @Get('audit-events/export')
  async exportAuditEvents(
    @Headers('authorization') authorization: string | undefined,
    @Query() query: unknown,
  ): Promise<unknown> {
    await this.workforce.authorize(authorization, 'Tavira.AuditExporter');
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
