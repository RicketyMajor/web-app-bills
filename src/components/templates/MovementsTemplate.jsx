import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { v } from "../../styles/variables";
import { rowMotion } from "../../styles/motion";
import { activeFilterCount, filterMovements, isoDate, monthStart, shortDate, sumTotals } from "../../utils/movements";
import { downloadCsv, toCsv } from "../../utils/csv";
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
import { Badge } from "../atoms/Badge";
import { IconButton } from "../atoms/IconButton";
import { PageHeader } from "../molecules/PageHeader";
import { LoadError } from "../molecules/LoadError";
import { MonthSelector } from "../molecules/MonthSelector";
import { MonthSlide } from "../molecules/MonthSlide";
import { SegmentedControl } from "../molecules/SegmentedControl";
import { MovementDialog } from "../organisms/MovementDialog";
import { ImportDialog } from "../organisms/ImportDialog";
import { MovementFilters } from "../organisms/MovementFilters";
import { ToolButton } from "../atoms/ToolButton";
import { Muted } from "../atoms/Muted";
import { Alert } from "../atoms/Alert";

const VIEW_KEYS = ["type", "q", "cat", "status", "min", "max", "all"];
const NO_FILTERS = { q: "", cat: "", status: "", min: "", max: "", all: "" };

export function MovementsTemplate() {
  const money = useMoney();
  const month = useMonthStore((s) => s.month);
  const [editing, setEditing] = useState(null); // null = dialog closed
  const [importing, setImporting] = useState(false);
  const { data: totals, isPlaceholderData: staleTotals } = useMonthTotals(month);

  // Type + filters render from local state, so inputs update with every keystroke
  // (router updates run in a transition and made the caret jump). The URL mirrors
  // them (replace: no history entries) so reload and shared links restore the view.
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState(() => Object.fromEntries(VIEW_KEYS.map((k) => [k, params.get(k) ?? ""])));
  const update = (changes) => {
    const next = { ...view, ...changes };
    setView(next);
    setParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value)), { replace: true });
  };
  const setFilter = (key, value) => update({ [key]: value });
  const clearFilters = () => update(NO_FILTERS);

  const type = view.type === "income" ? "income" : "expense";
  const all = view.all === "1";
  const filtering = view.q.trim() !== "" || activeFilterCount(view) > 0;
  const movements = useMovements(month, type, all);
  const rows = movements.data && filterMovements(movements.data, view);
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
        <MonthSelector disabled={all} />
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

      {/* Outside MonthSlide: the figures count from the previous month's values.
          Dimmed while they still show the previous month (placeholder data) and in
          All months, where the list no longer follows the selected month. */}
      <Kpis $stale={staleTotals || all} aria-busy={staleTotals}>
        <Kpi label="Income" value={totals?.income} sign={1} />
        <Kpi label="Expenses" value={totals && -totals.expense} sign={-1} />
        <Kpi label="Net" value={totals?.balance} sign={Math.sign(totals?.balance ?? 0)} />
      </Kpis>

      <SegmentedControl
        value={type}
        onChange={(t) => {
          // A category belongs to one type; "" = expense, the default
          update({ type: t === "income" ? t : "", cat: "" });
          remove.reset();
        }}
      />

      <MovementFilters type={type} values={view} onChange={setFilter} onClear={clearFilters}>
        <ToolButton onClick={() => setImporting(true)}>
          <v.iconoSubir aria-hidden="true" />
          Import CSV
        </ToolButton>
        <ToolButton
          disabled={!rows?.length}
          onClick={() => downloadCsv(`movements-${all ? "all" : month.slice(0, 7)}-${type}.csv`, toCsv(rows))}
        >
          <v.iconoDescargar aria-hidden="true" />
          Export CSV
        </ToolButton>
      </MovementFilters>

      {/* Next to the rows it counts; the empty state speaks for 0 results */}
      {filtering && rows?.length > 0 && (
        <Summary aria-live="polite">
          {rows.length} result{rows.length === 1 ? "" : "s"} · {money(sign * sumTotals(rows)[type])}
        </Summary>
      )}

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
        ) : rows.length === 0 ? (
          filtering ? (
            <Empty role="status">
              <p>No movements match these filters.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </Empty>
          ) : (
            <Muted>No {type === "income" ? "income" : "expenses"} this month.</Muted>
          )
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
                {rows.map((m, i) => {
                  const title = m.description || m.categories.name;
                  return (
                    <motion.li key={m.id} {...rowMotion(i)}>
                      <CategorySwatch $color={m.categories.color}>{m.categories.icon}</CategorySwatch>
                      <div className="main">
                        <span className="title">{title}</span>
                        <span className="meta">
                          {!!m.recurring_id && <v.iconoRepetir role="img" aria-label="Repeats" title="Repeats" />}
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
      {importing && <ImportDialog onClose={() => setImporting(false)} />}
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
// compact rows when the card is narrow (phones, or tablets beside the sidebar)
// with date and status folded into the meta line.
const Table = styled(Card)`
  container-type: inline-size;
  gap: 0;
  padding: 0;
  overflow: hidden;

  .thead,
  li {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 96px 80px 120px 72px;
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

  @container (max-width: 600px) {
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

const Summary = styled.p`
  color: ${({ theme }) => theme.textMuted};
  font-size: 14px;
  font-variant-numeric: tabular-nums;
`;

const Empty = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  color: ${({ theme }) => theme.textMuted};
  font-size: 14px;

  button {
    padding: 0;
    border: none;
    background: none;
    color: ${({ theme }) => theme.accent};
    font: inherit;
    font-weight: 500;
    cursor: pointer;
  }
  button:hover {
    text-decoration: underline;
  }
`;
