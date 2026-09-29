import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { rowMotion } from "../../styles/motion";
import { v } from "../../styles/variables";
import { useBareMoney, useMoney } from "../../hooks/useProfile";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { Meter } from "../atoms/Meter";
import { IconButton } from "../atoms/IconButton";

// Rows from budgetRows(): spent vs budget per category. Over budget turns the meter and figure expenseText.
// prevName turns on the note that explains the budget (Budgets page); onEdit adds an edit button.
export function BudgetList({ rows, prevName, onEdit }) {
  const bare = useBareMoney();
  const money = useMoney();
  // A big rolled-in overspend can take the budget below zero: keep its minus
  const cap = (n) => (n < 0 ? money(n) : bare(n));
  const note = (r) =>
    [
      r.override !== null && (r.base ? `usually ${bare(r.base)}` : "this month only"),
      r.carry > 0 && `+${bare(r.carry)} from ${prevName}`,
      r.carry < 0 && `${bare(r.carry)} over in ${prevName}`,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <List>
      <AnimatePresence>
        {rows.map((r, i) => {
          const over = r.left < 0;
          return (
            <motion.li key={r.id} {...rowMotion(i)}>
              <CategorySwatch $color={r.color}>{r.icon}</CategorySwatch>
              <div className="body">
                <div className="line">
                  <span className="name">{r.name}</span>
                  <span className={over ? "value over" : "value"}>
                    {bare(r.left)} {over ? "over" : "left"}
                  </span>
                </div>
                <Meter label={`${r.name} budget used`} ratio={r.ratio} over={over} delay={i * 0.04} />
                <span className="meta">
                  {bare(r.spent)} of {cap(r.budget)}
                  {prevName && note(r) && ` · ${note(r)}`}
                </span>
              </div>
              {onEdit && (
                <IconButton type="button" onClick={() => onEdit(r)} aria-label={`Edit ${r.name} budget`}>
                  <v.iconeditarTabla aria-hidden="true" />
                </IconButton>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
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
    flex: 1;
    flex-direction: column;
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
  .value.over {
    color: ${({ theme }) => theme.expenseText};
  }
  .meta {
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
`;
