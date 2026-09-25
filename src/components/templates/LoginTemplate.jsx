import { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { useAuthStore } from "../../store/authStore";
import { FeatureCarousel } from "../organisms/FeatureCarousel";

export function LoginTemplate() {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    setError(null);
    setPending(true);
    // On success the browser leaves for Google, so pending only resets on error
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setPending(false);
    }
  }

  return (
    <Container>
      <Showcase>
        <FeatureCarousel />
      </Showcase>

      <SignIn>
        <Brand>
          <img src={v.logo} alt="" />
          <span>Bills</span>
        </Brand>
        <h1>Your money, in plain sight</h1>
        <p>Track expenses, organize categories and see where your money goes each month.</p>

        <GoogleButton type="button" onClick={handleSignIn} disabled={pending}>
          <v.iconogoogle aria-hidden="true" />
          {pending ? "Redirecting…" : "Continue with Google"}
        </GoogleButton>
        {error && <ErrorText role="alert">{error}</ErrorText>}

        <small>Free · Your data is only visible to you</small>
      </SignIn>
    </Container>
  );
}

const Container = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  padding: 16px;
  gap: 16px;

  @media (max-width: ${v.bpmarge}) {
    grid-template-columns: 1fr;
    grid-template-areas: "signin" "showcase";
  }
`;

const Showcase = styled.div`
  display: grid;
  place-items: center;
  padding: 48px 32px;
  border-radius: 16px;
  background: ${({ theme }) => theme.accentSoft};

  @media (max-width: ${v.bpmarge}) {
    grid-area: showcase;
    padding: 32px 16px;
  }
`;

const SignIn = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 32px 16px;

  @media (max-width: ${v.bpmarge}) {
    grid-area: signin;
  }

  h1 {
    font-size: 32px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
  p {
    color: ${({ theme }) => theme.textMuted};
    font-size: 15px;
    line-height: 1.5;
  }
  small {
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
    text-align: center;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;

  img {
    width: 40px;
    height: 40px;
  }
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 48px;
  margin-top: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms;

  svg {
    font-size: 18px;
  }
  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
  &:active {
    transform: scale(0.97);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const ErrorText = styled.div`
  color: ${v.colorError};
  font-size: 14px;
  text-align: center;
`;
