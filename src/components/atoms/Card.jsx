import styled from "styled-components";

// Ledger card: surface + 1px border on the canvas, no shadow (spec 12)
export const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.surface};

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  h2 {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .head a {
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
    text-decoration: none;
  }
  .head a:hover {
    color: ${({ theme }) => theme.text};
  }
`;
