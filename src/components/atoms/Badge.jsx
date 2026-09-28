import styled from "styled-components";

// Small status pill (Pending, late). Accent on accentSoft: 4.5:1+ in both themes.
export const Badge = styled.span`
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.accent};
  font-size: 11px;
  font-weight: 600;
`;
