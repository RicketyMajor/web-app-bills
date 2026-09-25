import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { Sidebar } from "../organisms/Sidebar";
import { v } from "../../styles/variables";

export function AppLayout() {
  return (
    <Container>
      <Sidebar />
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;

  @media (max-width: ${v.bpbart}) {
    grid-template-columns: 1fr;
    padding-bottom: 64px;
  }
`;

const Main = styled.main`
  min-width: 0;
  padding: 32px;

  @media (max-width: ${v.bpbart}) {
    padding: 24px 16px;
  }
`;
