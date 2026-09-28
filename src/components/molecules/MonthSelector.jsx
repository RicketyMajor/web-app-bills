import styled from "styled-components";
import { motion } from "motion/react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { useMonthStore } from "../../store/monthStore";
import { monthLabel } from "../../utils/movements";
import { ease } from "../../styles/motion";

export function MonthSelector() {
  const month = useMonthStore((s) => s.month);
  const dir = useMonthStore((s) => s.dir);
  const shift = useMonthStore((s) => s.shift);

  return (
    <Container>
      <button type="button" onClick={() => shift(-1)} aria-label="Previous month">
        <RiArrowLeftSLine aria-hidden="true" />
      </button>
      <span className="label" aria-live="polite">
        <motion.span
          key={month}
          initial={{ opacity: 0, x: dir * 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease }}
        >
          {monthLabel(month)}
        </motion.span>
      </span>
      <button type="button" onClick={() => shift(1)} aria-label="Next month">
        <RiArrowRightSLine aria-hidden="true" />
      </button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};

  .label {
    display: grid;
    min-width: 136px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }
  button {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 6px;
    background: none;
    color: ${({ theme }) => theme.textMuted};
    font-size: 20px;
    cursor: pointer;
    transition: background-color 150ms, color 150ms;

    &:hover {
      background: ${({ theme }) => theme.border};
      color: ${({ theme }) => theme.text};
    }
    &:active {
      transform: scale(0.97);
    }
  }
`;
