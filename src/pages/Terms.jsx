import { Link } from "react-router-dom";
import { LegalTemplate, CONTACT_URL } from "../components/templates/LegalTemplate";

export function Terms() {
  return (
    <LegalTemplate title="Terms of Service" updated="September 27, 2026">
      <p>
        Bills is a free, personal expense tracker provided by Alonso Vera as an independent project.
        By signing in you agree to these terms.
      </p>

      <h2>Use of the service</h2>
      <ul>
        <li>You need a Google account to sign in. You are responsible for activity on your account.</li>
        <li>Use the app only for lawful purposes and do not attempt to access other users' data or disrupt the service.</li>
      </ul>

      <h2>Your data</h2>
      <p>
        You own the data you enter. It is handled as described in the{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided "as is", free of charge and without guarantees of availability or
        accuracy. It may be paused, changed or discontinued at any time. It is not financial advice;
        keep your own records for anything important.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, the author is not liable for any loss arising from use of the
        service, including lost or incorrect data.
      </p>

      <h2>Changes and contact</h2>
      <p>
        These terms may be updated; the date above reflects the latest version. Questions:{" "}
        <a href={CONTACT_URL}>{CONTACT_URL}</a>.
      </p>
    </LegalTemplate>
  );
}
