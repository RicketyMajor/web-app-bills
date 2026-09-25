import styled from "styled-components";
import {Btnsave} from "../../index";
export function LoginTemplate() {
  return (<Container>
<div>   
    <span>version 1.0</span>
    <div>
        <img/>
        <h1>Login</h1>
    </div>
    <Tittle>Web App Bills</Tittle>
    <p>Welcome to the Login Page</p>
<ContainerBtn>
<Btnsave/>
</ContainerBtn>

</div>
  </Container>);
}
const Container =styled.div`
  
`
const Tittle = styled.span`
    font-size: 5rem;
    font-weight: 700;    
`
const ContainerBtn = styled.div`
    display:flex;
    justify-content: center;

`