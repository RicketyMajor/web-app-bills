import styled from "styled-components";

// The one accent-filled action per screen
export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
