export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="sign-in-shell">
      <section className="sign-in-card" aria-labelledby="sign-in-title">
        <span className="wordmark">TAVIRA</span>
        <h1 id="sign-in-title">Workforce sign in</h1>
        <p>Use the Supabase account issued by a TAVIRA administrator.</p>
        {error ? (
          <p className="notice" role="alert">
            Sign-in failed. Check your email and password.
          </p>
        ) : null}
        <form action="/auth/login" method="post" className="sign-in-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
