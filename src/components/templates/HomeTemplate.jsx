import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { useAuthStore } from "../../store/authStore";
import { formatMoney } from "../../utils/formatMoney";
import { isoDate, monthLabel, monthStart, shortDate } from "../../utils/movements";
import { useMonthTotals } from "../../hooks/useMonthTotals";
import { useRecentMovements } from "../../hooks/useMovements";
import { useCategoryBreakdown, useMonthlyTrend } from "../../hooks/useReports";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { TrendChart } from "../organisms/TrendChart";
import { CategoryBreakdown } from "../organisms/CategoryBreakdown";
import { MovementDialog } from "../organisms/MovementDialog";

// formatMoney always signs; totals read better bare
const unsigned = (n) => formatMoney(Math.abs(n)).replace("+", "");

function greeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 19) return "Good afternoon";
  return "Good evening";
}

// Home is always "how am I doing now": the current month, independent of the month selector
export function HomeTemplate() {
  const user = useAuthStore((s) => s.session?.user);
  const firstName = (user?.user_metadata?.full_name ?? user?.email)?.split(" ")[0];
  const now = new Date();
  const month = monthStart(now);
  const monthName = monthLabel(month).split(" ")[0];
  const [adding, setAdding] = useState(false);

  const totals = useMonthTotals(month);
  const trend = useMonthlyTrend(month);
  const recent = useRecentMovements(5);
  const breakdown = useCategoryBreakdown(month, "expense");

  return (
    <Container>
      <Header>
        <h1>
          {greeting(now.getHours())}, {firstName}
        </h1>
        <PrimaryButton type="button" onClick={() => setAdding(true)}>
          <v.agregar aria-hidden="true" />
          New expense
        </PrimaryButton>
      </Header>

      {recent.data?.length === 0 ? (
        <Welcome>
          <h2>Your month starts with one entry</h2>
          <p>
            Log an expense or your income and Home fills in with this month's balance, your 6-month trend
            and where your money goes.
          </p>
          <Link to="/categories">Review your categories first →</Link>
        </Welcome>
      ) : (
        <>
          <Hero aria-label={`${monthName} balance`}>
            {totals.isPending ? (
              <Muted>Loading…</Muted>
            ) : totals.isError ? (
              <Alert role="alert">Couldn't load this month's totals.</Alert>
            ) : (
              <Balance totals={totals.data} monthName={monthName} />
            )}
          </Hero>

          <Card aria-labelledby="trend-title">
            <div className="head">
              <h2 id="trend-title">Last 6 months</h2>
              <Link to="/reports">Reports →</Link>
            </div>
            {trend.isPending ? (
              <Muted>Loading…</Muted>
            ) : trend.isError ? (
              <Alert role="alert">Couldn't load the trend.</Alert>
            ) : trend.data.every((d) => d.income === 0 && d.expense === 0) ? (
              <Muted>No movements in the last 6 months.</Muted>
            ) : (
              <TrendChart data={trend.data} current={month} half={48} />
            )}
          </Card>

          <Columns>
            <Card aria-labelledby="recent-title">
              <div className="head">
                <h2 id="recent-title">Recent</h2>
                <Link to="/movements">See all →</Link>
              </div>
              {recent.isPending ? (
                <Muted>Loading…</Muted>
              ) : recent.isError ? (
                <Alert role="alert">Couldn't load movements.</Alert>
              ) : (
                <Recent>
                  {recent.data.map((m) => {
                    const income = m.categories.type === "income";
                    return (
                      <li key={m.id}>
                        <CategorySwatch $color={m.categories.color}>{m.categories.icon}</CategorySwatch>
                        <div className="main">
                          <span className="title">{m.description || m.categories.name}</span>
                          <span className="meta">
                            {m.categories.name} · {shortDate(m.date)}
                          </span>
                        </div>
                        <Amount $color={income ? v.colorIngresos : v.colorGastos}>
                          {formatMoney(income ? m.amount : -m.amount)}
                        </Amount>
                      </li>
                    );
                  })}
                </Recent>
              )}
            </Card>

            <Card aria-labelledby="where-title">
              <div className="head">
                <h2 id="where-title">Where it goes</h2>
                <Link to="/reports">Reports →</Link>
              </div>
              {breakdown.isPending ? (
                <Muted>Loading…</Muted>
              ) : breakdown.isError ? (
                <Alert role="alert">Couldn't load categories.</Alert>
              ) : breakdown.data.length === 0 ? (
                <Muted>No expenses in {monthName} yet.</Muted>
              ) : (
                // Top 3 by amount; % stays the share of the whole month
                <CategoryBreakdown rows={breakdown.data} limit={3} />
              )}
            </Card>
          </Columns>
        </>
      )}

      {adding && (
        <MovementDialog movement={{ type: "expense", date: isoDate(now) }} onClose={() => setAdding(false)} />
      )}
    </Container>
  );
}

// Signature: what's left of this month's income, and how much of it is already spent
function Balance({ totals, monthName }) {
  const { income, expense, balance } = totals;
  const ratio = income > 0 ? expense / income : null;
  const over = balance < 0;

  if (income === 0 && expense === 0) {
    return <p className="caption">Nothing logged in {monthName} yet.</p>;
  }

  return (
    <>
      <p className="lead">
        <strong className={over ? "figure over" : "figure"}>{unsigned(balance)}</strong>
        <span className="caption">
          {over ? `more spent than earned in ${monthName}` : `left from ${monthName}'s income`}
        </span>
      </p>
      {ratio !== null && (
        <Meter
          role="meter"
          aria-label="Share of income spent"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, Math.round(ratio * 100))}
          $over={over}
        >
          <div style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
        </Meter>
      )}
      <p className="meta">
        {ratio === null ? (
          <span>
            <b>{unsigned(expense)}</b> spent · no income logged yet
          </span>
        ) : (
          <>
            <span>{Math.round(ratio * 100)}% spent</span>
            <span>
              <b>{unsigned(expense)}</b> of <b>{unsigned(income)}</b> income
            </span>
          </>
        )}
      </p>
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;

  /* Wide basis: on phones the button wraps below instead of squeezing the greeting */
  h1 {
    flex: 1 1 280px;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
`;

// The focal point: one big figure read as a sentence, everything else demoted to muted meta
const Hero = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  background: ${({ theme }) => theme.accentSoft};

  .lead {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 12px;
  }
  .figure {
    font-size: 44px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }
  .figure.over {
    color: ${v.colorGastos};
  }
  /* On the tinted surface, secondary text is the foreground at 72% (muted gray drops below 4.5:1) */
  .caption {
    color: color-mix(in srgb, ${({ theme }) => theme.text} 72%, transparent);
    font-size: 15px;
    font-weight: 500;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 16px;
    color: color-mix(in srgb, ${({ theme }) => theme.text} 72%, transparent);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  .meta b {
    color: ${({ theme }) => theme.text};
    font-weight: 600;
  }

  @media (max-width: ${v.bplisa}) {
    padding: 20px 16px;
    .figure {
      font-size: 36px;
    }
  }
`;

// Accent while within income; expense red once over (the summary text says so too)
const Meter = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.border};

  div {
    height: 100%;
    border-radius: 4px;
    background: ${({ $over, theme }) => ($over ? v.colorGastos : theme.accent)};
  }
`;

const Welcome = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 32px 24px;
  border-radius: 16px;
  background: ${({ theme }) => theme.accentSoft};

  h2 {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
  p {
    max-width: 52ch;
    color: color-mix(in srgb, ${({ theme }) => theme.text} 72%, transparent);
    font-size: 15px;
    line-height: 1.5;
    text-wrap: pretty;
  }
  a {
    color: ${({ theme }) => theme.accent};
    font-size: 14px;
    font-weight: 500;
  }
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: ${v.bpmarge}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  h2 {
    font-size: 16px;
    font-weight: 600;
  }
  .head a {
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
    text-decoration: none;
  }
  .head a:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const Recent = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
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
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
`;

const Amount = styled.span`
  color: ${({ $color }) => $color};
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const Muted = styled.p`
  color: ${({ theme }) => theme.textMuted};
  font-size: 14px;
`;

const Alert = styled.p`
  color: ${v.colorError};
  font-size: 14px;
`;
