import { randomBytes } from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. The service-role key must remain server-only.',
  );
  process.exit(1);
}

const users = [
  {
    email: process.env.TAVIRA_TEST_MODERATOR_EMAIL ?? 'moderator@tavira.test',
    roles: ['Tavira.Moderator'],
  },
  {
    email: process.env.TAVIRA_TEST_AUDITOR_EMAIL ?? 'auditor@tavira.test',
    roles: ['Tavira.AuditExporter'],
  },
];

const headers = {
  apikey: serviceRoleKey,
  authorization: `Bearer ${serviceRoleKey}`,
  'content-type': 'application/json',
};

const existingUsers = await listUsers();
for (const user of users) {
  const existing = existingUsers.find(
    (candidate) => candidate.email?.toLowerCase() === user.email.toLowerCase(),
  );
  const password = generatePassword();
  const payload = {
    email: user.email,
    password,
    email_confirm: true,
    app_metadata: { roles: user.roles },
  };
  const response = await fetch(
    existing
      ? `${supabaseUrl}/auth/v1/admin/users/${existing.id}`
      : `${supabaseUrl}/auth/v1/admin/users`,
    {
      method: existing ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Could not seed ${user.email}: ${response.status} ${detail}`,
    );
  }
  console.log(
    JSON.stringify({
      email: user.email,
      password,
      roles: user.roles,
      action: existing ? 'updated' : 'created',
    }),
  );
}

async function listUsers() {
  const allUsers = [];
  for (let page = 1; ; page += 1) {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=100`,
      { headers },
    );
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Could not list users: ${response.status} ${detail}`);
    }
    const body = await response.json();
    const pageUsers = Array.isArray(body.users) ? body.users : [];
    allUsers.push(...pageUsers);
    if (pageUsers.length < 100) return allUsers;
  }
}

function generatePassword() {
  return `${randomBytes(18).toString('base64url')}Aa1!`;
}
