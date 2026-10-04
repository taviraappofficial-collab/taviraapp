import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { accessTokenCookie } from './auth/config';

type Report = {
  id: string;
  reporterId: string;
  targetAccountId: string;
  category: string;
  details: string | null;
  status: string;
  createdAt: string;
};

async function loadReports(): Promise<{ reports: Report[]; error?: string }> {
  const apiUrl = process.env.TAVIRA_API_URL;
  const accessToken = (await cookies()).get(accessTokenCookie)?.value;
  if (!apiUrl || !accessToken)
    return {
      reports: [],
      error: 'Sign in with your TAVIRA workforce account to review reports.',
    };
  try {
    const response = await fetch(
      `${apiUrl}/v1/admin/moderation/reports?limit=100`,
      {
        headers: { authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );
    if (!response.ok)
      return { reports: [], error: `Admin API returned ${response.status}.` };
    return (await response.json()) as { reports: Report[] };
  } catch {
    return { reports: [], error: 'Admin API is unavailable.' };
  }
}

async function updateReport(formData: FormData): Promise<void> {
  'use server';
  const apiUrl = process.env.TAVIRA_API_URL;
  const accessToken = (await cookies()).get(accessTokenCookie)?.value;
  const reportId = String(formData.get('reportId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!apiUrl || !accessToken || !reportId) return;
  await fetch(`${apiUrl}/v1/admin/moderation/reports/${reportId}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      status,
      note: `Changed to ${status} in admin console`,
    }),
  });
  revalidatePath('/');
}

export default async function Page() {
  const result = await loadReports();
  return (
    <main>
      <header>
        <div className="brand-row">
          <span>TAVIRA</span>
          <nav>
            <a href="/auth/login">Workforce sign in</a>
            <a href="/auth/logout">Sign out</a>
          </nav>
        </div>
        <h1>Safety review</h1>
        <p>
          Oldest reports appear first. Every status change creates an audit
          event.
        </p>
      </header>
      {result.error ? <p className="notice">{result.error}</p> : null}
      <section aria-label="Safety reports">
        {result.reports.length === 0 ? (
          <p className="empty">No reports in the queue.</p>
        ) : null}
        {result.reports.map((report) => (
          <article key={report.id}>
            <div className="report-heading">
              <strong>{report.category.replace('_', ' ')}</strong>
              <small>{report.status}</small>
            </div>
            <p>{report.details || 'No additional details supplied.'}</p>
            <dl>
              <div>
                <dt>Target</dt>
                <dd>{report.targetAccountId}</dd>
              </div>
              <div>
                <dt>Reporter</dt>
                <dd>{report.reporterId}</dd>
              </div>
              <div>
                <dt>Received</dt>
                <dd>{new Date(report.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
            <form action={updateReport}>
              <input type="hidden" name="reportId" value={report.id} />
              <button name="status" value="reviewing">
                Reviewing
              </button>
              <button name="status" value="resolved">
                Resolve
              </button>
              <button className="quiet" name="status" value="dismissed">
                Dismiss
              </button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
