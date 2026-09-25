import styled from "styled-components";
import { Btnsave } from "../molecules/Btnsave";
import { v } from "../../styles/variables";
import { useAuthStore } from "../../store/authStore";

// ponytail: temporary user header + sign out; moves into the Sidebar (spec 02)
export function HomeTemplate() {
  const user = useAuthStore((s) => s.session?.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Container>
      <h1>Hello, {user?.user_metadata?.full_name ?? user?.email}</h1>
      <Btnsave
        titulo="Sign out"
        icono={<v.iconoCerrarSesion />}
        bgcolor={v.colorSecundario}
        funcion={signOut}
      />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
`;
