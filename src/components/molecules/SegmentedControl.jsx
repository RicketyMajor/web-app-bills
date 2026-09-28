import { useId } from "react";
import styled from "styled-components";
import { motion } from "motion/react";
import { spring } from "../../styles/motion";

const TYPES = [
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
];

// Toggle group; the selected pill slides between options (layoutId per instance)
export function SegmentedControl({ value, onChange, options = TYPES, label = "Type" }) {
  const id = useId();
  return (
    <Group role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="pill" transition={spring} />}
          <span className="text">{o.label}</span>
        </button>
      ))}
    </Group>
  );
}

const Group = styled.div`
  display: flex;
  gap: 2px;
  width: fit-content;
  padding: 3px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};

  button {
    position: relative;
    height: 30px;
    padding: 0 14px;
    border: none;
    border-radius: 6px;
    background: none;
    color: ${({ theme }) => theme.textMuted};
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 150ms;
  }
  button:hover {
    color: ${({ theme }) => theme.text};
  }
  button[aria-pressed="true"] {
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
  }
  .pill {
    position: absolute;
    inset: 0;
    border-radius: 6px;
    background: ${({ theme }) => theme.accentSoft};
  }
  .text {
    position: relative;
  }
`;
