import { Link } from "react-router-dom";
import styled from "styled-components";
import { Logo } from "../atoms/Logo";

export const CONTACT_URL = "https://github.com/RicketyMajor/web-app-bills/issues";

// Shared layout for the public Privacy Policy and Terms of Service pages
export function LegalTemplate({ title, updated, children }) {
  return (
    <Container>
      <Link to="/" className="brand">
        <Logo size={28} />
        <span>Bills</span>
      </Link>
      <h1>{title}</h1>
      <p className="updated">Last updated: {updated}</p>
      {children}
      <footer>
        <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link>
      </footer>
    </Container>
  );
}

const Container = styled.main`
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px;
  line-height: 1.6;
  font-size: 15px;

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 32px;
    color: inherit;
    font-weight: 600;
    text-decoration: none;
  }
  h1 { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
  h2 { margin: 32px 0 8px; font-size: 18px; font-weight: 600; }
  p, ul { margin: 8px 0; }
  ul { padding-left: 20px; }
  a { color: ${({ theme }) => theme.accent}; }
  .updated, footer { color: ${({ theme }) => theme.textMuted}; font-size: 13px; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid ${({ theme }) => theme.border}; }
`;
