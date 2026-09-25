import styled from "styled-components";
import {Icono} from "../../index";
export function Btnsave({funcion,titulo,bgcolor,icono}) {
  return (
  <Container type="submit" bgcolor={bgcolor}>
    <Icono>{icono}</Icono>
    <span className="btn" onClick={funcion}>
    {titulo}
    </span>
  </Container>);
}
const Container =styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    border: none;
    .btn{
        background-color:${(props)=>props.bgcolor};
    }
`;