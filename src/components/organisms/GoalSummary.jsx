import { Link } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { rowMotion } from "../../styles/motion";
import { useToday } from "../../hooks/useToday";
import { sortGoals } from "../../utils/goals";
import { useGoals } from "../../hooks/useGoals";
import { useBareMoney } from "../../hooks/useProfile";
import { Card } from "../atoms/Card";
import { Meter } from "../atoms/Meter";

// Home side card: up to 3 active goals (soonest deadline first). Hidden when there are none.
// ponytail: no skeleton/error here (like Budgets) — the Goals page shows those states
export function GoalSummary() {
  const bare = useBareMoney();
  const goals = useGoals();
  const today = useToday();
  if (!goals.data) return null;
  const { active } = sortGoals(goals.data, today);
  if (active.length === 0) return null;

  return (
    <Card className="goals" aria-labelledby="goals-title">
      <div className="head">
        <h2 id="goals-title">Goals</h2>
        <Link to="/goals">Goals →</Link>
      </div>
      <List>
        <AnimatePresence>
          {active.slice(0, 3).map(({ goal, progress }, i) => (
            <motion.li key={goal.id} {...rowMotion(i)}>
              <span className="icon" aria-hidden="true">
                {goal.icon}
              </span>
              <div className="body">
                <div className="line">
                  <Link to={`/goals?goal=${goal.id}`} className="name">
                    {goal.name}
                  </Link>
                  <span className="value">
                    {bare(progress.saved)} of {bare(Number(goal.target))}
                  </span>
                </div>
                <Meter label={`${goal.name} progress`} ratio={progress.ratio} delay={i * 0.04} />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </List>
    </Card>
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
  .icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: ${({ theme }) => theme.border};
    font-size: 18px;
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
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .name {
    overflow: hidden;
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .name:hover {
    text-decoration: underline;
  }
  .value {
    flex-shrink: 0;
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
`;
