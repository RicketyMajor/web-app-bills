import { useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { v } from "../../styles/variables";
import { rowMotion } from "../../styles/motion";
import { isoDate, monthStart, shortDate } from "../../utils/movements";
import { useMonthStore } from "../../store/monthStore";
import { useMonthTotals } from "../../hooks/useMonthTotals";
import { useDeleteMovement, useMovements } from "../../hooks/useMovements";
import { useMoney } from "../../hooks/useProfile";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { Card } from "../atoms/Card";
import { Skeleton } from "../atoms/Skeleton";
import { Amount } from "../atoms/Amount";
import { AnimatedNumber } from "../atoms/AnimatedNumber";
import { PageHeader } from "../molecules/PageHeader";
import { LoadError } from "../molecules/LoadError";
import { MonthSelector } from "../molecules/MonthSelector";
import { MonthSlide } from "../molecules/MonthSlide";
import { SegmentedControl } from "../molecules/SegmentedControl";
import { MovementDialog } from "../organisms/MovementDialog";

export function MovementsTemplate() {
  const money = useMoney();
  const month = useMonthStore((s) => s.month);
  const [type, setType] = useState("expense");
  const [editing, setEditing] = useState(null); // null = dialog closed
  const { data: totals, isPlaceholderData: staleTotals } = useMonthTotals(month);
  const movements = useMovements(month, type);
  const remove = useDeleteMovement();

  // New movements default to today when viewing the current month
  const newDate = month === monthStart(new Date()) ? isoDate(new Date()) : month;
  const sign = type === "income" ? 1 : -1;

  const handleDelete = (m) => {
    if (confirm(`Delete this ${money(sign * m.amount)} movement?`)) remove.mutate(m.id);
  };

  return (
    <Container>
      <PageHeader title="Movements">
        <MonthSelector />
        <PrimaryButton type="button" onClick={() => setEditing({ type, date: newDate })}>
          <v.agregar aria-hidden="true" />
          <StableLabel>
            {["expense", "income"].map((t) => (
              <span key={t} className={t === type ? undefined : "off"}>
                New {t}
              </span>
            ))}
          </StableLabel>
        </PrimaryButton>
      </PageHeader>

      {/* Outside MonthSlide: the figures count from the previous month's values */}
      {/* Dimmed while they still show the previous month (placeholder data) */}
      <Kpis $stale={staleTotals} aria-busy={staleTotals}>
        <Kpi label="Income" value={totals?.income} sign={1} />
        <Kpi label="Expenses" value={totals && -totals.expense} sign={-1} />
        <Kpi label="Net" value={totals?.balance} sign={Math.sign(totals?.balance ?? 0)} />
      </Kpis>

      <SegmentedControl
        value={type}
        onChange={(t) => {
          setType(t);
          remove.reset();
        }}
      />

      {remove.isError && <Alert role="alert">Couldn't delete the movement. Please try again.</Alert>}

      <MonthSlide>
        {movements.isPending ? (
          <Card aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} $h={40} />
            ))}
          </Card>
        ) : movements.isError ? (
          <LoadError message="Couldn't load movements." onRetry={movements.refetch} />
        ) : movements.data.length === 0 ? (
          <Muted>No {type === "income" ? "income" : "expenses"} this month.</Muted>
        ) : (
          <Table as="div">
            <div className="thead" aria-hidden="true">
              <span />
              <span>Description</span>
              <span>Date</span>
              <span>Status</span>
              <span className="num">Amount</span>
              <span />
            </div>
            <ul>
              <AnimatePresence>
                {movements.data.map((m, i) => {
                  const title = m.description || m.categories.name;
                  return (
                    <motion.li key={m.id} {...rowMotion(i)}>
                      <CategorySwatch $color={m.categories.color}>{m.categories.icon}</CategorySwatch>
                      <div className="main">
                        <span className="title">{title}</span>
                        <span className="meta">
                          <span>{m.categories.name}</span>
                          <span className="m-only">· {shortDate(m.date)}</span>
                          {!m.paid && <Badge className="m-only">Pending</Badge>}
                        </span>
                      </div>
                      <span className="date">{shortDate(m.date)}</span>
                      <span className="status">{m.paid ? "Paid" : <Badge>Pending</Badge>}</span>
                      <Amount $sign={sign} className="num">
                        {money(sign * m.amount)}
                      </Amount>
                      <div className="actions">
                        <IconButton type="button" onClick={() => setEditing({ ...m, type })} aria-label={`Edit ${title}`}>
                          <v.iconeditarTabla aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(m)}
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
          </Table>
        )}
      </MonthSlide>

      {editing && <MovementDialog movement={editing} onClose={() => setEditing(null)} />}
    </Container>
  );
}

function Kpi({ label, value, sign }) {
  const money = useMoney();
  return (
    <KpiCard as="div" $sign={sign}>
      <span>{label}</span>
      <strong>{value === undefined ? "—" : <AnimatedNumber value={value} format={money} />}</strong>
    </KpiCard>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 960px;
`;

// Both labels share one grid cell, so the button keeps the wider width
// and the month selector doesn't shift when the tab changes.
const StableLabel = styled.span`
  display: grid;
  justify-items: center;

  > * {
    grid-area: 1 / 1;
  }
  .off {
    visibility: hidden;
  }
`;

const Kpis = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  opacity: ${({ $stale }) => ($stale ? 0.5 : 1)};
  transition: opacity 150ms;

  @media (max-width: ${v.bplisa}) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled(Card)`
  gap: 4px;
  padding: 16px;

  /* Direct child only: AnimatedNumber renders a span inside strong */
  > span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
  }
  strong {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: ${({ $sign, theme }) =>
      $sign > 0 ? theme.incomeText : $sign < 0 ? theme.expenseText : theme.text};
  }
  /* Phones: one compact row per figure instead of three tall cards */
  @media (max-width: ${v.bplisa}) {
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    padding: 12px 16px;
    strong {
      font-size: 20px;
    }
  }
`;

// Table-like rows on desktop (swatch · description · date · status · amount · actions);
// compact rows below 48em with date and status folded into the meta line.
const Table = styled(Card)`
  gap: 0;
  padding: 0;
  overflow: hidden;

  .thead,
  li {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 72px 80px 120px 72px;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
  }
  .thead {
    height: 36px;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
    font-weight: 500;
  }
  ul {
    list-style: none;
  }
  li {
    min-height: 56px;
    overflow: hidden;
  }
  li + li {
    border-top: 1px solid ${({ theme }) => theme.border};
  }
  .num {
    text-align: right;
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
  /* Pieces never break inside; the badge wraps to a second line on narrow rows */
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 6px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
  .meta > * {
    white-space: nowrap;
  }
  .date,
  .status {
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  .m-only {
    display: none;
  }
  /* Hover/focus reveals the row actions; always visible without a pointer */
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
    opacity: 0;
    transition: opacity 150ms;
  }
  li:hover .actions,
  li:focus-within .actions {
    opacity: 1;
  }
  @media (hover: none) {
    .actions {
      opacity: 1;
    }
  }

  @media (max-width: ${v.bpbart}) {
    .thead {
      display: none;
    }
    li {
      grid-template-columns: 36px minmax(0, 1fr) auto auto;
    }
    .date,
    .status {
      display: none;
    }
    .m-only {
      display: inline;
    }
    .actions {
      opacity: 1;
    }
  }
`;

const Badge = styled.span`
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.accent};
  font-size: 11px;
  font-weight: 600;
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 17px;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;

  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
  &.danger:hover {
    color: ${({ theme }) => theme.expenseText};
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
