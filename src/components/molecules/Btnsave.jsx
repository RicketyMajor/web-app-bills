import styled from "styled-components";
import { Icono } from "../atoms/Icono";

export function Btnsave({ funcion, titulo, bgcolor, icono, type = "button" }) {
  return (
    <Container type={type} onClick={funcion} $bgcolor={bgcolor}>
      {icono && <Icono aria-hidden="true">{icono}</Icono>}
      <span>{titulo}</span>
    </Container>
  );
}

const Container = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: ${(props) => props.$bgcolor};
`;
