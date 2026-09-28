import { createGlobalStyle } from "styled-components";
import { Dark } from "./themes";

export const GlobalStyle = createGlobalStyle`
  /* Native controls (checkbox, select lists, search clear, date picker, scrollbars) follow the theme */
  :root {
    color-scheme: ${({ theme }) => (theme === Dark ? "dark" : "light")};
    accent-color: ${({ theme }) => theme.accent};
  }

  body {
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    -webkit-font-smoothing: antialiased;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }
`;
