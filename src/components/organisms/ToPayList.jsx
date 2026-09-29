import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { RiCheckLine } from "react-icons/ri";
import { v } from "../../styles/variables";
import { rowMotion, ease } from "../../styles/motion";
import { dueLabel, isoDate } from "../../utils/movements";
import { useMoney } from "../../hooks/useProfile";
import { usePendingMovements, useSaveMovement } from "../../hooks/useMovements";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { Amount } from "../atoms/Amount";
import { Skeleton } from "../atoms/Skeleton";
import { Badge } from "../atoms/Badge";
import { LoadError } from "../molecules/LoadError";
import { Muted } from "../atoms/Muted";
import { Alert } from "../atoms/Alert";

// Unpaid movements, oldest first (late ones on top). One click settles one (only that row waits); the row leaves when the list refetches.
export function ToPayList() {
  const money = useMoney();
  const pending = usePendingMovements();
  const save = useSaveMovement();
  const today = isoDate(new Date());

  if (pending.isPending)
    return (
      <Stack aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} $h={36} />
        ))}
      </Stack>
    );
  if (pending.isError) return <LoadError message="Couldn't load pending movements." onRetry={pending.refetch} />;
  if (pending.data.length === 0) return <Muted>Nothing pending. You're all caught up.</Muted>;

  return (
    <Stack>
      <List>
        <AnimatePresence>
          {pending.data.map((m, i) => {
            const income = m.categories.type === "income";
            const title = m.description || m.categories.name;
            const settling = save.isPending && save.variables?.id === m.id;
            const due = dueLabel(m.date, today);
            return (
              <motion.li key={m.id} {...rowMotion(i)}>
                <CategorySwatch $color={m.categories.color}>{m.categories.icon}</CategorySwatch>
                <div className="main">
                  <span className="title">{title}</span>
                  <span className="meta">
                    {!!m.recurring_id && <v.iconoRepetir role="img" aria-label="Repeats" title="Repeats" />}
                    {m.categories.name} · {due.late ? <Badge>{due.text}</Badge> : due.text}
                  </span>
                </div>
                <Amount $sign={income ? 1 : -1}>{money(income ? m.amount : -m.amount)}</Amount>
                <button
                  type="button"
                  onClick={() => save.mutate({ id: m.id, paid: true })}
                  disabled={settling}
                  aria-label={`Mark ${title} as ${income ? "received" : "paid"}`}
                  title={income ? "Mark received" : "Mark paid"}
                >
                  {settling ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, ease }}
                      />
                    </svg>
                  ) : (
                    <RiCheckLine aria-hidden="true" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </List>
      {save.isError && <Alert role="alert">Couldn't update it. Please try again.</Alert>}
    </Stack>
  );
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    overflow: hidden;
  }
  li + li {
    border-top: 1px solid ${({ theme }) => theme.border};
  }
  .main {
    display: flex;
    flex: 1;
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
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
  .meta svg {
    margin-right: 4px;
    vertical-align: -0.125em;
  }
  button {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 6px;
    background: none;
    color: ${({ theme }) => theme.textMuted};
    font-size: 18px;
    cursor: pointer;
    transition: background-color 150ms, color 150ms, border-color 150ms;
  }
  button:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
  button:disabled {
    cursor: default;
  }
`;
