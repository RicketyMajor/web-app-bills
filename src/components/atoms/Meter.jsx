import styled from "styled-components";
import { motion } from "motion/react";
import { ease } from "../../styles/motion";

// Share-of-a-cap bar (hero, budgets): accent while within; expense red once over (the text says so too)
export function Meter({ label, ratio, over, delay = 0 }) {
  return (
    <Track
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, Math.round(ratio * 100))}
      aria-valuetext={`${Math.round(ratio * 100)}%`} // the real share, even past 100
      $over={over}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(ratio, 1) * 100}%` }}
        transition={{ duration: 0.6, ease, delay }}
      />
    </Track>
  );
}

const Track = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.border};

  div {
    height: 100%;
    border-radius: 3px;
    background: ${({ $over, theme }) => ($over ? theme.expenseText : theme.accent)};
  }
`;
