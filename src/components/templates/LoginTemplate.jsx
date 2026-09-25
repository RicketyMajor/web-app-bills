import { useState } from "react";
import styled from "styled-components";
import { Btnsave } from "../molecules/Btnsave";
import { v } from "../../styles/variables";
import { useAuthStore } from "../../store/authStore";

export function LoginTemplate() {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const [error, setError] = useState(null);

  async function handleSignIn() {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  }

  return (
    <Container>
      <div>
        <span>version 1.0</span>
        <div>
          <img src={v.logo} alt="Web App Bills logo" />
          <h1>Login</h1>
        </div>
        <Title>Web App Bills</Title>
        <p>Welcome to the Login Page</p>
        <ContainerBtn>
          <Btnsave
            titulo="Sign in with Google"
            icono={<v.iconogoogle />}
            bgcolor={v.colorSecundario}
            funcion={handleSignIn}
          />
        </ContainerBtn>
        {error && <ErrorText role="alert">{error}</ErrorText>}
      </div>
    </Container>
  );
}

const Container = styled.div``;

const Title = styled.span`
  font-size: 5rem;
  font-weight: 700;
`;

const ContainerBtn = styled.div`
  display: flex;
  justify-content: center;
`;

const ErrorText = styled.p`
  color: ${v.colorError};
  text-align: center;
`;
