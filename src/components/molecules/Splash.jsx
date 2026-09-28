import styled from "styled-components";
import { Logo } from "../atoms/Logo";

// Shown while the session resolves or the first page chunk loads: the monogram assembles
export function Splash() {
  return (
    <Center role="status" aria-label="Loading">
      <Logo size={48} animated />
    </Center>
  );
}

const Center = styled.div`
  display: grid;
  place-items: center;
  min-height: 100vh;
`;
