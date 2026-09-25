import styled from "styled-components";
import { useAuthStore } from "../../store/authStore";

export function HomeTemplate() {
  const user = useAuthStore((s) => s.session?.user);
  const firstName = (user?.user_metadata?.full_name ?? user?.email)?.split(" ")[0];

  return (
    <Container>
      <h1>Hello, {firstName}</h1>
    </Container>
  );
}

const Container = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
`;
