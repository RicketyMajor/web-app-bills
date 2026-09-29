import styled from "styled-components";
import { v } from "../../styles/variables";
import { shortDate } from "../../utils/movements";
import { canRemove, historyOf, paceLabel } from "../../utils/goals";
import { useMoney } from "../../hooks/useProfile";
import { useDeleteContribution } from "../../hooks/useGoals";
import { Card } from "../atoms/Card";
import { Meter } from "../atoms/Meter";
import { Badge } from "../atoms/Badge";
import { IconButton } from "../atoms/IconButton";
import { ToolButton } from "../atoms/ToolButton";

// Right column of /goals: progress, pace, actions and the history (newest first)
export function GoalDetail({ goal, progress, onAdd, onWithdraw, onEdit, onDelete, deleting }) {
  const money = useMoney();
  const bare = (n) => money(n).replace("+", "");
  const remove = useDeleteContribution();
  const pace = paceLabel(progress, goal.deadline, bare);
  const history = historyOf(goal);

  const handleRemove = (c) => {
    if (confirm(`Delete this ${bare(Math.abs(c.amount))} ${c.amount < 0 ? "withdrawal" : "contribution"}?`))
      remove.mutate(c.id);
  };

  return (
    <Section aria-labelledby="goal-title">
      <div className="head">
        <h2 id="goal-title">
          <span aria-hidden="true">{goal.icon}</span> {goal.name}
        </h2>
        <div className="tools">
          <IconButton type="button" onClick={onEdit} aria-label={`Edit ${goal.name}`}>
            <v.iconeditarTabla aria-hidden="true" />
          </IconButton>
          <IconButton
            type="button"
            className="danger"
            onClick={onDelete}
            disabled={deleting}
            aria-label={`Delete ${goal.name}`}
          >
            <v.iconeliminarTabla aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <p className="figure">
        <strong>{bare(progress.saved)}</strong> of {bare(Number(goal.target))}
      </p>
      <Meter label={`${goal.name} progress`} ratio={progress.ratio} />
      {progress.reached ? (
        <p className="pace">
          <Badge>Reached</Badge>
        </p>
      ) : (
        // No deadline → no pace; say what's left instead of leaving the line empty
        <p className="pace">{pace || `${bare(progress.left)} to go`}</p>
      )}

      <div className="actions">
        <ToolButton onClick={onAdd}>
          <v.agregar aria-hidden="true" />
          Add money
        </ToolButton>
        <ToolButton onClick={onWithdraw} disabled={progress.saved <= 0}>
          Withdraw
        </ToolButton>
      </div>

      <h3>History</h3>
      {history.length === 0 ? (
        <p className="muted">No money added yet.</p>
      ) : (
        <ul>
          {history.map((c) => {
            const out = Number(c.amount) < 0;
            const removable = canRemove(progress.saved, c.amount);
            return (
              <li key={c.id}>
                <span className="date">{shortDate(c.date)}</span>
                <span className="note">{c.note || (out ? "Withdrawn" : "Added")}</span>
                <span className="amount">
                  {out ? "−" : "+"}
                  {bare(Math.abs(c.amount))}
                </span>
                <IconButton
                  type="button"
                  className="danger"
                  onClick={() => handleRemove(c)}
                  disabled={remove.isPending || !removable}
                  title={removable ? undefined : "Can't delete: the goal would go below zero"}
                  aria-label={`Delete ${out ? "withdrawal" : "contribution"} of ${bare(Math.abs(c.amount))} on ${shortDate(c.date)}${removable ? "" : " (not possible: the goal would go below zero)"}`}
                >
                  <v.iconeliminarTabla aria-hidden="true" />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
      {remove.isError && (
        <p className="alert" role="alert">
          Couldn't delete it. Please try again.
        </p>
      )}
    </Section>
  );
}

const Section = styled(Card)`
  gap: 12px;
  min-width: 0;

  h2 {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 20px;
    letter-spacing: -0.02em;
  }
  .tools {
    display: flex;
    gap: 4px;
  }
  .figure {
    color: ${({ theme }) => theme.textMuted};
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .figure strong {
    margin-right: 4px;
    color: ${({ theme }) => theme.text};
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.03em;
  }
  .pace {
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 4px 0 8px;
  }
  h3 {
    padding-top: 12px;
    border-top: 1px solid ${({ theme }) => theme.border};
    font-size: 14px;
    font-weight: 600;
  }
  ul {
    list-style: none;
  }
  li {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto 30px;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 0 4px;
  }
  li + li {
    border-top: 1px solid ${({ theme }) => theme.border};
  }
  .date,
  .muted {
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  .note {
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* Neutral on purpose: green/red mean income/expense */
  .amount {
    font-size: 14px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .alert {
    color: ${v.colorError};
    font-size: 14px;
  }
`;
