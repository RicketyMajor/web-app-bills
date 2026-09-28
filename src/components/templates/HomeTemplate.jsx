import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { v } from "../../styles/variables";
import { ease, rowMotion } from "../../styles/motion";
import { useAuthStore } from "../../store/authStore";
import { isoDate, monthLabel, monthStart, shiftMonth, shortDate } from "../../utils/movements";
import { useMonthTotals } from "../../hooks/useMonthTotals";
import { useRecentMovements } from "../../hooks/useMovements";
import { useCategoryBreakdown, useCumulativeSpending } from "../../hooks/useReports";
import { useMoney, useProfile } from "../../hooks/useProfile";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { Card } from "../atoms/Card";
import { Skeleton } from "../atoms/Skeleton";
import { Amount } from "../atoms/Amount";
import { AnimatedNumber } from "../atoms/AnimatedNumber";
import { PageHeader } from "../molecules/PageHeader";
import { LoadError } from "../molecules/LoadError";
import { CumulativeChart } from "../organisms/CumulativeChart";
import { CategoryBreakdown } from "../organisms/CategoryBreakdown";
import { ToPayList } from "../organisms/ToPayList";
import { MovementDialog } from "../organisms/MovementDialog";

function greeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 19) return "Good afternoon";
  return "Good evening";
}

// Home is always "how am I doing now": the current month, independent of the month selector.
// Layout B (spec 12): main column (balance, recent) + side column (to pay, where it goes).
export function HomeTemplate() {
  const money = useMoney();
  const user = useAuthStore((s) => s.session?.user);
  const profile = useProfile().data;
  // Name edited in Settings wins; Google metadata is the fallback
  const firstName = (profile?.full_name || user?.user_metadata?.full_name || user?.email)?.split(" ")[0];
  const now = new Date();
  const month = monthStart(now);
  const monthName = monthLabel(month).split(" ")[0];
  const prevName = monthLabel(shiftMonth(month, -1)).split(" ")[0];
  const [adding, setAdding] = useState(false);

  const totals = useMonthTotals(month);
  const cumulative = useCumulativeSpending(month);
  const recent = useRecentMovements(6);
  const breakdown = useCategoryBreakdown(month, "expense");

  return (
    <Container>
      <PageHeader title={`${greeting(now.getHours())}, ${firstName}`}>
        <PrimaryButton type="button" onClick={() => setAdding(true)}>
          <v.agregar aria-hidden="true" />
          New expense
        </PrimaryButton>
      </PageHeader>

      {recent.data?.length === 0 ? (
        <Welcome>
          <h2>Your month starts with one entry</h2>
          <p>
            Log an expense or your income and Home fills in with this month's balance, how your spending
            compares with last month, and what's still to pay.
          </p>
          <Link to="/categories">Review your categories first →</Link>
        </Welcome>
      ) : (
        <Layout>
          <div className="col">
            <Card className="balance" aria-label={`${monthName} balance`} aria-busy={totals.isPending}>
              {totals.isPending ? (
                <>
                  <Skeleton $h={44} $w="60%" />
                  <Skeleton $h={6} />
                </>
              ) : totals.isError ? (
                <LoadError message="Couldn't load this month's totals." onRetry={totals.refetch} />
              ) : (
                <Balance totals={totals.data} monthName={monthName} />
              )}
              {cumulative.isPending ? (
                <Skeleton $h={112} />
              ) : cumulative.isError ? (
                <LoadError message="Couldn't load the spending chart." onRetry={cumulative.refetch} />
              ) : (
                <CumulativeChart {...cumulative.data} monthName={monthName} prevName={prevName} />
              )}
            </Card>

            <Card className="recent" aria-labelledby="recent-title" aria-busy={recent.isPending}>
              <div className="head">
                <h2 id="recent-title">Recent</h2>
                <Link to="/movements">See all →</Link>
              </div>
              {recent.isPending ? (
                [0, 1, 2, 3].map((i) => <Skeleton key={i} $h={36} />)
              ) : recent.isError ? (
                <LoadError message="Couldn't load movements." onRetry={recent.refetch} />
              ) : (
                <Rows>
                  <AnimatePresence>
                    {recent.data.map((m, i) => {
                      const income = m.categories.type === "income";
                      return (
                        <motion.li key={m.id} {...rowMotion(i)}>
                          <CategorySwatch $color={m.categories.color}>{m.categories.icon}</CategorySwatch>
                          <div className="main">
                            <span className="title">{m.description || m.categories.name}</span>
                            <span className="meta">
                              {m.categories.name} · {shortDate(m.date)}
                            </span>
                          </div>
                          <Amount $sign={income ? 1 : -1}>{money(income ? m.amount : -m.amount)}</Amount>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </Rows>
              )}
            </Card>
          </div>

          <div className="col">
            <Card className="topay" aria-labelledby="topay-title">
              <div className="head">
                <h2 id="topay-title">To pay</h2>
                <Link to="/movements">Movements →</Link>
              </div>
              <ToPayList />
            </Card>

            <Card className="where" aria-labelledby="where-title" aria-busy={breakdown.isPending}>
              <div className="head">
                <h2 id="where-title">Where it goes</h2>
                <Link to="/reports">Reports →</Link>
              </div>
              {breakdown.isPending ? (
                [0, 1, 2].map((i) => <Skeleton key={i} $h={36} />)
              ) : breakdown.isError ? (
                <LoadError message="Couldn't load categories." onRetry={breakdown.refetch} />
              ) : breakdown.data.length === 0 ? (
                <Muted>No expenses in {monthName} yet.</Muted>
              ) : (
                // Top 4 by amount; % stays the share of the whole month
                <CategoryBreakdown rows={breakdown.data} limit={4} />
              )}
            </Card>
          </div>
        </Layout>
      )}

      {adding && (
        <MovementDialog movement={{ type: "expense", date: isoDate(now) }} onClose={() => setAdding(false)} />
      )}
    </Container>
  );
}

// Signature: what's left of this month's income, and how much of it is already spent
function Balance({ totals, monthName }) {
  const money = useMoney();
  // money() always signs; totals read better bare
  const unsigned = (n) => money(Math.abs(n)).replace("+", "");
  const { income, expense, balance } = totals;
  const ratio = income > 0 ? expense / income : null;
  const over = balance < 0;

  if (income === 0 && expense === 0) {
    return <p className="caption">Nothing logged in {monthName} yet.</p>;
  }

  return (
    <BalanceBody>
      <p className="lead">
        <strong className={over ? "figure over" : "figure"}>
          <AnimatedNumber value={Math.abs(balance)} format={unsigned} />
        </strong>
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
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(ratio, 1) * 100}%` }}
            transition={{ duration: 0.6, ease }}
          />
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
    </BalanceBody>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1120px;
`;

// Two columns on desktop; one column in reading order (balance, to pay, recent, where) below 62em
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  .col {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }
  @media (max-width: ${v.bpmarge}) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    .col {
      display: contents;
    }
    .balance {
      order: 1;
    }
    .topay {
      order: 2;
    }
    .recent {
      order: 3;
    }
    .where {
      order: 4;
    }
  }
`;

const BalanceBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .lead {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 12px;
  }
  .figure {
    font-size: 40px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }
  .figure.over {
    color: ${({ theme }) => theme.expenseText};
  }
  .caption {
    color: ${({ theme }) => theme.textMuted};
    font-size: 14px;
    font-weight: 500;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 16px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  .meta b {
    color: ${({ theme }) => theme.text};
    font-weight: 600;
  }
  @media (max-width: ${v.bplisa}) {
    .figure {
      font-size: 32px;
    }
  }
`;

// Accent while within income; expense red once over (the summary text says so too)
const Meter = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.border};

  div {
    height: 100%;
    border-radius: 3px;
    background: ${({ $over, theme }) => ($over ? theme.expenseText : theme.accent)};
  }
`;

const Welcome = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 32px 24px;
  border-radius: 10px;
  background: ${({ theme }) => theme.accentSoft};

  h2 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
  /* On the tinted surface, secondary text is the foreground at 72% (muted fails 4.5:1) */
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

const Rows = styled.ul`
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

const Muted = styled.p`
  color: ${({ theme }) => theme.textMuted};
  font-size: 14px;
`;
