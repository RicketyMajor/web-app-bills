import styled from "styled-components";

const tabs = [
  { type: "expense", label: "Expenses" },
  { type: "income", label: "Income" },
];

export function TypeTabs({ value, onChange }) {
  return (
    <Group role="group" aria-label="Type">
      {tabs.map((t) => (
        <button
          key={t.type}
          type="button"
          aria-pressed={value === t.type}
          onClick={() => onChange(t.type)}
        >
          {t.label}
        </button>
      ))}
    </Group>
  );
}

const Group = styled.div`
  display: flex;
  gap: 4px;
  width: fit-content;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;

  button {
    height: 32px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    background: none;
    color: ${({ theme }) => theme.textMuted};
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 150ms, color 150ms;

    &:hover {
      color: ${({ theme }) => theme.text};
    }
    &[aria-pressed="true"] {
      background: ${({ theme }) => theme.accentSoft};
      color: ${({ theme }) => theme.accent};
      font-weight: 600;
    }
  }
`;
