import styled from "styled-components";

// Signed money figure: income green, expense red (theme text tokens, ≥4.5:1)
export const Amount = styled.span`
  color: ${({ $sign, theme }) => ($sign > 0 ? theme.incomeText : theme.expenseText)};
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;
