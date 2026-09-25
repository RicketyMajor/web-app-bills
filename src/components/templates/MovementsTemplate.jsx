import { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { formatMoney } from "../../utils/formatMoney";
import { isoDate, monthStart, shortDate } from "../../utils/movements";
import { useMonthStore } from "../../store/monthStore";
import { useMonthTotals } from "../../hooks/useMonthTotals";
import { useDeleteMovement, useMovements } from "../../hooks/useMovements";
import { MonthSelector } from "../molecules/MonthSelector";
import { TypeTabs } from "../molecules/TypeTabs";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { MovementDialog } from "../organisms/MovementDialog";

export function MovementsTemplate() {
  const month = useMonthStore((s) => s.month);
  const [type, setType] = useState("expense");
  const [editing, setEditing] = useState(null); // null = dialog closed
  const { data: totals } = useMonthTotals(month);
  const { data: movements, isPending, isError } = useMovements(month, type);
  const remove = useDeleteMovement();

  // New movements default to today when viewing the current month
  const newDate = month === monthStart(new Date()) ? isoDate(new Date()) : month;
  const sign = type === "income" ? 1 : -1;

  const handleDelete = (m) => {
    if (confirm(`Delete this ${formatMoney(sign * m.amount)} movement?`)) remove.mutate(m.id);
  };

  return (
    <Container>
      <Header>
        <h1>Movements</h1>
        <MonthSelector />
        <Primary type="button" onClick={() => setEditing({ type, date: newDate })}>
          <v.agregar aria-hidden="true" />
          New {type}
        </Primary>
      </Header>

      <Stats>
        <Stat $color={v.colorIngresos}>
          <span>Income</span>
          <strong>{totals ? formatMoney(totals.income) : "—"}</strong>
        </Stat>
        <Stat $color={v.colorGastos}>
          <span>Expenses</span>
          <strong>{totals ? formatMoney(-totals.expense) : "—"}</strong>
        </Stat>
        <Stat $sign={Math.sign(totals?.balance ?? 0)}>
          <span>Balance</span>
          <strong>{totals ? formatMoney(totals.balance) : "—"}</strong>
        </Stat>
      </Stats>

      <TypeTabs
        value={type}
        onChange={(t) => {
          setType(t);
          remove.reset();
        }}
      />

      {remove.isError && <Alert role="alert">Couldn't delete the movement. Please try again.</Alert>}

      {isPending ? (
        <Muted>Loading…</Muted>
      ) : isError ? (
        <Alert role="alert">Couldn't load movements.</Alert>
      ) : movements.length === 0 ? (
        <Muted>No {type === "income" ? "income" : "expenses"} this month.</Muted>
      ) : (
        <List>
          {movements.map((m) => {
            const title = m.description || m.categories.name;
            return (
              <li key={m.id}>
                <CategorySwatch $color={m.categories.color}>{m.categories.icon}</CategorySwatch>
                <div className="main">
                  <span className="title">{title}</span>
                  <span className="meta">
                    {m.categories.name} · {shortDate(m.date)}
                    {!m.paid && <Badge>Pending</Badge>}
                  </span>
                </div>
                <Amount $color={type === "income" ? v.colorIngresos : v.colorGastos}>
                  {formatMoney(sign * m.amount)}
                </Amount>
                <IconButton
                  type="button"
                  onClick={() => setEditing({ ...m, type })}
                  aria-label={`Edit ${title}`}
                >
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
              </li>
            );
          })}
        </List>
      )}

      {editing && <MovementDialog movement={editing} onClose={() => setEditing(null)} />}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 760px;
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;

  h1 {
    flex: 1;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
`;

const Primary = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;

  @media (max-width: ${v.bplisa}) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.border};
    @media (max-width: ${v.bplisa}) {
      border-left: none;
      border-top: 1px solid ${({ theme }) => theme.border};
    }
  }
  span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  strong {
    font-size: 22px;
    font-weight: 600;
    color: ${({ $color, $sign, theme }) =>
      $color ?? ($sign > 0 ? v.colorIngresos : $sign < 0 ? v.colorGastos : theme.text)};
  }
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
  }
  li + li {
    border-top: 1px solid ${({ theme }) => theme.border};
  }
  .main {
    display: flex;
    flex-direction: column;
    flex: 1;
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
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
`;

const Badge = styled.span`
  padding: 0 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.accent};
  font-size: 11px;
  font-weight: 600;
`;

const Amount = styled.span`
  color: ${({ $color }) => $color};
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 18px;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;

  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
  &.danger:hover {
    color: ${v.colorGastos};
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
