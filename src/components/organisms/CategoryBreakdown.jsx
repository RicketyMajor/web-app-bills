import styled from "styled-components";
import { motion } from "motion/react";
import { ease } from "../../styles/motion";
import { useMoney } from "../../hooks/useProfile";
import { CategorySwatch } from "../atoms/CategorySwatch";

// Ranked list; bar width is relative to the top category, % is share of the month.
// Every value is printed, so the list is its own table view.
export function CategoryBreakdown({ rows, limit }) {
  const money = useMoney();
  const sum = rows.reduce((s, r) => s + r.total, 0);
  const top = rows[0]?.total || 1;

  return (
    <List>
      {rows.slice(0, limit).map((r, i) => (
        <li key={r.id}>
          <CategorySwatch $color={r.color}>{r.icon}</CategorySwatch>
          <div className="body">
            <div className="line">
              <span className="name">{r.name}</span>
              <span className="value">
                {money(r.total).replace("+", "")}
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
