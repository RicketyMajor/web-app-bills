import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  50% { opacity: 0.5; }
`;

// Placeholder block while a card loads; the card sets aria-busy
export const Skeleton = styled.span.attrs({ "aria-hidden": true })`
  display: block;
  width: ${({ $w }) => $w ?? "100%"};
  height: ${({ $h }) => $h}px;
  border-radius: 6px;
  background: ${({ theme }) => theme.border};

  @media (prefers-reduced-motion: no-preference) {
    animation: ${pulse} 1.4s ease-in-out infinite;
  }
`;
