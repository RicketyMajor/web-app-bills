import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import { motion } from "motion/react";
import { Sidebar } from "../organisms/Sidebar";
import { v } from "../../styles/variables";
import { ease } from "../../styles/motion";
import { useSyncRecurring } from "../../hooks/useRecurring";

export function AppLayout() {
  useSyncRecurring(); // spec 15: create this month's recurring movements
  const { pathname } = useLocation();
  return (
    <Container>
      <Sidebar />
      <Main>
        {/* Pages are lazy-loaded; suspend here so the sidebar stays put */}
        <Suspense fallback={null}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
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
  padding: 32px 40px;

  @media (max-width: ${v.bpbart}) {
    padding: 24px 16px;
  }
`;
