import styled from "styled-components";
import { motion } from "motion/react";
import { ease } from "../../styles/motion";
import { useBareMoney } from "../../hooks/useProfile";
import { CategorySwatch } from "../atoms/CategorySwatch";

// "↑18%" / "↓12%" / "New"; neutral on purpose (up is bad for spending, good for income)
function Delta({ delta, compare }) {
  if (delta === undefined || !compare) return null;
  if (delta === "new")
    return (
      <small title={`None in ${compare}`}>
        <span aria-hidden="true">New</span>
        <span className="sr-only">new, none in {compare}</span>
      </small>
    );
  const pct = Math.round(Math.abs(delta) * 100);
  if (pct === 0) return null;
  const text = `${pct}% ${delta > 0 ? "more" : "less"} than ${compare}`;
  return (
    <small title={text}>
      <span aria-hidden="true">
        {delta > 0 ? "↑" : "↓"}
        {pct}%
      </span>
      <span className="sr-only">{text}</span>
    </small>
  );
}

// Ranked list; bar width is relative to the top category, % is share of the month.
// Every value is printed, so the list is its own table view.
export function CategoryBreakdown({ rows, limit, compare }) {
  const bare = useBareMoney();
  const sum = rows.reduce((s, r) => s + r.total, 0);
  const top = rows[0]?.total || 1;

  return (
    <List>
      {rows.slice(0, limit).map((r, i) => (
        <li key={r.id}>
          <CategorySwatch $color={r.color}>{r.icon}</CategorySwatch>
          <div className="body">
            <div className="line">
              <span className="label">
                <span className="name">{r.name}</span>
                <Delta delta={r.delta} compare={compare} />
              </span>
              <span className="value">
                {bare(r.total)}
                <small>{Math.round((r.total / sum) * 100)}%</small>
              </span>
            </div>
            <div className="track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(r.total / top) * 100}%` }}
                transition={{ duration: 0.6, ease, delay: i * 0.04 }}
                style={{ background: r.color }}
              />
            </div>
          </div>
        </li>
      ))}
    </List>
  );
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .body {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 6px;
    min-width: 0;
  }
  .line {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 14px;
  }
  .name {
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .label {
    display: flex;
    align-items: baseline;
    min-width: 0;
  }
  .label small {
    flex-shrink: 0;
  }
  .value {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  small {
    margin-left: 8px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
    font-weight: 500;
  }
  .track {
    height: 6px;
    border-radius: 3px;
    background: ${({ theme }) => theme.border};
  }
  .track > div {
    height: 100%;
    border-radius: 3px;
  }
`;
