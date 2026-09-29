import styled from "styled-components";

// Secondary toolbar button (Filters, Export CSV): 36px, surface + 1px border, same height as the fields
export const ToolButton = styled.button.attrs({ type: "button" })`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.fieldBorder};
  border-radius: 6px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.border};
  }
  &:active:not(:disabled) {
    transform: scale(0.97);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.textMuted};
    transition: transform 150ms;
  }
  /* Disclosure chevron flips while its panel is open */
  &[aria-expanded="true"] svg {
    transform: rotate(180deg);
  }
`;
