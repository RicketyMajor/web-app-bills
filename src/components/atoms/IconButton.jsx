import styled from "styled-components";

// 30px square icon action (edit, delete); `.danger` turns expense-red on hover
export const IconButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 17px;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;

  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
  &.danger:hover {
    color: ${({ theme }) => theme.expenseText};
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
