import styled from "styled-components";

// Page title + its actions (month selector, primary button) on one wrapping row
export function PageHeader({ title, children }) {
  return (
    <Header>
      <h1>{title}</h1>
      {children}
    </Header>
  );
}

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;

  /* Wide basis: on phones the actions wrap below instead of squeezing the title */
  h1 {
    flex: 1 1 240px;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
`;
