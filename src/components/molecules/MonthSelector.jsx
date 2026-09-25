import styled from "styled-components";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { useMonthStore } from "../../store/monthStore";
import { monthLabel } from "../../utils/movements";

export function MonthSelector() {
  const month = useMonthStore((s) => s.month);
  const shift = useMonthStore((s) => s.shift);

  return (
    <Container>
      <button type="button" onClick={() => shift(-1)} aria-label="Previous month">
        <RiArrowLeftSLine aria-hidden="true" />
      </button>
      <span aria-live="polite">{monthLabel(month)}</span>
      <button type="button" onClick={() => shift(1)} aria-label="Next month">
        <RiArrowRightSLine aria-hidden="true" />
      </button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;

  span {
    min-width: 136px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }
  button {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
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
