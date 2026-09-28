import styled from "styled-components";
import { v } from "../../styles/variables";

// Inline failure for one card, with a way out
export function LoadError({ message, onRetry }) {
  return (
    <Row role="alert">
      <span>{message}</span>
      <button type="button" onClick={() => onRetry()}>
        Retry
      </button>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  color: ${v.colorError};
  font-size: 14px;

  button {
    height: 28px;
    padding: 0 10px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 6px;
    background: none;
    color: ${({ theme }) => theme.text};
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  button:hover {
    background: ${({ theme }) => theme.border};
  }
`;
