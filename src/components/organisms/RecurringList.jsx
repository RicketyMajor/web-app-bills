import { useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { v } from "../../styles/variables";
import { rowMotion } from "../../styles/motion";
import { isoDate } from "../../utils/movements";
import { pauseThrough, repeatLabel, resumeThrough } from "../../utils/recurring";
import { useMoney } from "../../hooks/useProfile";
import { useDeleteRecurring, useRecurring, useSaveRecurring } from "../../hooks/useRecurring";
import { Card } from "../atoms/Card";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { Amount } from "../atoms/Amount";
import { Badge } from "../atoms/Badge";
import { Skeleton } from "../atoms/Skeleton";
import { IconButton } from "../atoms/IconButton";
import { LoadError } from "../molecules/LoadError";
import { RecurringDialog } from "./RecurringDialog";

// Settings "Recurring": the rules behind auto-created pending movements (spec 15)
export function RecurringList() {
  const money = useMoney();
  const rules = useRecurring();
  const save = useSaveRecurring();
  const remove = useDeleteRecurring();
  const [editing, setEditing] = useState(null); // null = dialog closed

  const toggle = (r) => {
    const today = isoDate(new Date());
    remove.reset();
    save.mutate(
      r.active
        ? { id: r.id, active: false, generated_through: pauseThrough(r.generated_through, today) }
        : { id: r.id, active: true, generated_through: resumeThrough(r.generated_through, today) }
    );
  };
  const handleDelete = (r, title) => {
    if (!confirm(`Stop repeating ${title}? Movements already added stay.`)) return;
    save.reset();
    remove.mutate(r.id);
  };

  return (
    <Section aria-labelledby="recurring-title">
      <h2 id="recurring-title">Recurring</h2>
      {/* Pausing deletes movements, so it's said on screen, not only in the switch's tooltip */}
      {rules.data?.length > 0 && (
        <Muted className="lead">
          Added as pending movements when they're due. Pausing one removes its upcoming unpaid movements.
        </Muted>
      )}
      {rules.isPending ? (
        <div className="stack" aria-busy="true">
          {[0, 1].map((i) => (
            <Skeleton key={i} $h={40} />
          ))}
        </div>
      ) : rules.isError ? (
        <LoadError message="Couldn't load recurring movements." onRetry={rules.refetch} />
      ) : rules.data.length === 0 ? (
        <Muted>No recurring movements yet. Choose Repeat when you add one.</Muted>
      ) : (
        <ul>
          <AnimatePresence>
            {rules.data.map((r, i) => {
              const title = r.description || r.categories.name;
              const sign = r.categories.type === "income" ? 1 : -1;
              return (
                <motion.li key={r.id} {...rowMotion(i)} className={r.active ? undefined : "paused"}>
                  <CategorySwatch $color={r.categories.color}>{r.categories.icon}</CategorySwatch>
                  <div className="main">
                    <span className="title">{title}</span>
                    <span className="meta">
                      <span>{repeatLabel(r.frequency, r.anchor)}</span>
                      {!r.active && <Badge>Paused</Badge>}
                    </span>
                  </div>
                  <Amount $sign={sign}>{money(sign * r.amount)}</Amount>
                  <div className="actions">
                    <Switch
                      aria-checked={r.active}
                      aria-label={`Repeat ${title}`}
                      title={r.active ? "Pause" : "Resume"}
                      onClick={() => toggle(r)}
                      disabled={save.isPending}
                    />
                    <IconButton type="button" onClick={() => setEditing(r)} aria-label={`Edit ${title}`}>
                      <v.iconeditarTabla aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(r, title)}
                      disabled={remove.isPending}
                      aria-label={`Delete ${title}`}
                    >
                      <v.iconeliminarTabla aria-hidden="true" />
                    </IconButton>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      {save.isError && <Alert role="alert">Couldn't save the change. Please try again.</Alert>}
      {remove.isError && <Alert role="alert">Couldn't delete it. Please try again.</Alert>}
      {editing && <RecurringDialog rule={editing} onClose={() => setEditing(null)} />}
    </Section>
  );
}

const Section = styled(Card)`
  container-type: inline-size;

  /* Tucks under the title (the card's 16px gap would read as a new section) */
  .lead {
    margin-top: -10px;
    font-size: 13px;
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  ul {
    list-style: none;
  }
  li {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    /* Room for the focus ring of the edge controls (overflow clips for the exit animation) */
    padding: 0 4px;
    overflow: hidden;
  }
  /* Paused: the swatch fades (decorative); text keeps full contrast and the badge says it */
  li.paused > :first-child {
    opacity: 0.45;
  }
  li + li {
    border-top: 1px solid ${({ theme }) => theme.border};
  }
  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .title {
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 6px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  /* Narrow cards: actions move under the text */
  @container (max-width: 440px) {
    li {
      grid-template-columns: 36px minmax(0, 1fr) auto;
      padding: 8px 4px;
    }
    .actions {
      grid-column: 2 / -1;
    }
  }
`;

// On = accent track; the thumb is textMuted when off so it reads on the border-colored track
const Switch = styled.button.attrs({ type: "button", role: "switch" })`
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 24px;
  margin-right: 4px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.border};
  cursor: pointer;
  transition: background-color 150ms;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.textMuted};
    transition: transform 150ms, background-color 150ms;
  }
  &[aria-checked="true"] {
    background: ${({ theme }) => theme.accent};
  }
  &[aria-checked="true"]::after {
    background: ${({ theme }) => theme.onAccent};
    transform: translateX(16px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const Muted = styled.p`
  color: ${({ theme }) => theme.textMuted};
  font-size: 14px;
`;

const Alert = styled.p`
  color: ${v.colorError};
  font-size: 14px;
`;
