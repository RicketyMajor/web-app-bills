import styled from "styled-components";
import { motion } from "motion/react";
import { useMoney } from "../../hooks/useProfile";
import { ease } from "../../styles/motion";

const W = 300;
const H = 96;

// Running spend this month (solid, drawn in) vs last month (dashed), day by day.
// The aria-label carries the comparison the picture shows.
export function CumulativeChart({ current, previous, days, monthName, prevName }) {
  const money = useMoney();
  const bare = (n) => money(n).replace("+", "");
  const n = Math.max(days, previous.length);
  const max = Math.max(1, ...current, ...previous);
  const x = (i) => (n > 1 ? (i / (n - 1)) * W : 0);
  const y = (val) => H - 2 - (val / max) * (H - 8);
  const line = (arr) => arr.map((val, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(val).toFixed(1)}`).join(" ");

  const spent = current.at(-1) ?? 0;
  const sameDay = previous[Math.min(current.length, previous.length) - 1] ?? 0;
  const last = current.length - 1;

  return (
    <Figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${bare(spent)} spent so far in ${monthName}; ${bare(sameDay)} by the same day of ${prevName}.`}
      >
        <path d={line(previous)} className="prev" />
        {current.length > 0 && (
          <>
            <motion.path
              d={line(current)}
              className="cur"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease }}
            />
            <motion.circle
              cx={x(last)}
              cy={y(current[last])}
              r="3"
              className="dot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.2 }}
            />
          </>
        )}
      </svg>
      <figcaption>
        <span>
          <i className="cur" /> {monthName}
        </span>
        <span>
          <i className="prev" /> {prevName}
        </span>
      </figcaption>
    </Figure>
  );
}

const Figure = styled.figure`
  display: flex;
  flex-direction: column;
  gap: 8px;

  svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }
  path {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  path.cur {
    stroke: ${({ theme }) => theme.accent};
    stroke-width: 2;
  }
  path.prev {
    stroke: ${({ theme }) => theme.textMuted};
    stroke-width: 1.5;
    stroke-dasharray: 3 4;
  }
  .dot {
    fill: ${({ theme }) => theme.accent};
  }
  figcaption {
    display: flex;
    gap: 16px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
  figcaption span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  figcaption i {
    width: 12px;
    height: 0;
    border-top: 2px solid ${({ theme }) => theme.accent};
  }
  figcaption i.prev {
    border-top: 2px dashed ${({ theme }) => theme.textMuted};
  }
`;
