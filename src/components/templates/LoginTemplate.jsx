import styled from "styled-components";
import { Btnsave } from "../molecules/Btnsave";
import { v } from "../../styles/variables";

export function LoginTemplate() {
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
          />
        </ContainerBtn>
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
