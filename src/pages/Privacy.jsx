import { LegalTemplate, CONTACT_URL } from "../components/templates/LegalTemplate";

export function Privacy() {
  return (
    <LegalTemplate title="Privacy Policy" updated="September 27, 2026">
      <p>
        Bills is a personal expense tracker built and maintained by Alonso Vera as an independent
        project. This policy explains what data the app handles and why.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your Google account basics</strong> — name, email address and profile picture, received
          when you sign in with Google. We only request the <code>openid</code>, <code>email</code> and{" "}
          <code>profile</code> scopes.
        </li>
        <li>
          <strong>What you enter</strong> — the categories and income/expense movements you create
          (amounts, dates, descriptions).
        </li>
        <li>
          <strong>In your browser</strong> — your sign-in session and theme preference are kept in
          local storage. No advertising or analytics cookies are used.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to sign you in and show you your own data. We do not sell, share or use your data for
        advertising, and we do not access your Gmail, contacts, Drive or any other Google data.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Data is stored with <a href="https://supabase.com/privacy">Supabase</a> (database and
        authentication) and the app is served by <a href="https://vercel.com/legal/privacy-policy">Vercel</a>.
        Row-level security ensures each account can only read and change its own records.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Your data is kept while your account exists. You can delete categories and movements at any
        time from the app. To delete your account and all its data, open a request at{" "}
        <a href={CONTACT_URL}>{CONTACT_URL}</a> and it will be removed.
      </p>

      <h2>Google API Services</h2>
      <p>
        Bills' use of information received from Google APIs adheres to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2>Changes and contact</h2>
      <p>
        If this policy changes, the date above will be updated. Questions:{" "}
        <a href={CONTACT_URL}>{CONTACT_URL}</a>.
      </p>
    </LegalTemplate>
  );
}
