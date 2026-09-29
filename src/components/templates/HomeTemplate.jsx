import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { v } from "../../styles/variables";
import { rowMotion } from "../../styles/motion";
import { useAuthStore } from "../../store/authStore";
import { isoDate, monthName, monthStart, shiftMonth, shortDate } from "../../utils/movements";
import { useMonthTotals } from "../../hooks/useMonthTotals";
import { useRecentMovements } from "../../hooks/useMovements";
import { useCategoryBreakdown, useCumulativeSpending } from "../../hooks/useReports";
import { useBareMoney, useMoney, useProfile } from "../../hooks/useProfile";
import { useCategories } from "../../hooks/useCategories";
import { compareLabel, heroReference } from "../../utils/reports";
import { budgetRows } from "../../utils/budgets";
import { useBudgetMonth } from "../../hooks/useBudgets";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { Meter } from "../atoms/Meter";
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
import { BudgetList } from "../organisms/BudgetList";
import { GoalSummary } from "../organisms/GoalSummary";
import { MovementDialog } from "../organisms/MovementDialog";
import { Muted } from "../atoms/Muted";

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
  const monthLong = monthName(month);
  const prevName = monthName(shiftMonth(month, -1));
  const [adding, setAdding] = useState(false);

  const totals = useMonthTotals(month);
  const cumulative = useCumulativeSpending(month);
  const recent = useRecentMovements(6);
  const breakdown = useCategoryBreakdown(month, "expense");
  const expenseCategories = useCategories("expense");
  // ponytail: the card stays hidden while loading or on error; the Budgets page shows those states
  const budgetMonth = useBudgetMonth(month);
  const budgets =
    expenseCategories.data && budgetMonth.data
      ? budgetRows(expenseCategories.data, month, budgetMonth.data.overrides, budgetMonth.data)
      : [];

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
            <Card className="balance" aria-label={`${monthLong} balance`} aria-busy={totals.isPending}>
              {totals.isPending ? (
                <>
                  <Skeleton $h={44} $w="60%" />
                  <Skeleton $h={6} />
                </>
              ) : totals.isError ? (
                <LoadError message="Couldn't load this month's totals." onRetry={totals.refetch} />
              ) : (
                <Balance totals={totals.data} budget={profile?.monthly_budget} monthName={monthLong} />
              )}
              {cumulative.isPending ? (
                <Skeleton $h={112} />
              ) : cumulative.isError ? (
                <LoadError message="Couldn't load the spending chart." onRetry={cumulative.refetch} />
              ) : (
                <CumulativeChart {...cumulative.data} monthName={monthLong} prevName={prevName} />
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

            {budgets.length > 0 && (
              <Card className="budgets" aria-labelledby="budgets-title">
                <div className="head">
                  <h2 id="budgets-title">Budgets</h2>
                  <Link to="/budgets">Budgets →</Link>
                </div>
                <BudgetList rows={budgets.slice(0, 5)} />
              </Card>
            )}

            <GoalSummary />

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
                <Muted>No expenses in {monthLong} yet.</Muted>
              ) : (
                // Top 4 by amount; % stays the share of the whole month
                <CategoryBreakdown rows={breakdown.data} limit={4} compare={compareLabel(month, isoDate(now))} />
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

// Signature: what's left of this month's budget (or income, without one), and how much is spent
function Balance({ totals, budget, monthName }) {
  const unsigned = useBareMoney();
  const { income, expense } = totals;
  const { byBudget, base, left, over, ratio } = heroReference(totals, budget);

  if (!byBudget && income === 0 && expense === 0) {
    return <p className="caption">Nothing logged in {monthName} yet.</p>;
  }

  const caption = byBudget
    ? over
      ? "over your budget"
      : `left of your ${unsigned(base)} budget`
    : over
      ? `more spent than earned in ${monthName}`
      : `left from ${monthName}'s income`;

  return (
    <BalanceBody>
      <p className="lead">
        <strong className={over ? "figure over" : "figure"}>
          <AnimatedNumber value={Math.abs(left)} format={unsigned} />
        </strong>
        <span className="caption">{caption}</span>
      </p>
      {ratio !== null && (
        <Meter label={byBudget ? "Share of budget spent" : "Share of income spent"} ratio={ratio} over={over} />
      )}
      <p className="meta">
        {ratio === null ? (
          <span>
            <b>{unsigned(expense)}</b> spent · no income logged yet
          </span>
        ) : (
          <>
            <span>
              {Math.round(ratio * 100)}% {byBudget ? "of budget" : "spent"}
            </span>
            <span>
              <b>{unsigned(expense)}</b> of <b>{unsigned(base)}</b> {byBudget ? "budget" : "income"}
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

// Two columns on desktop; one column in reading order (balance, to pay, budgets, recent, where) below 62em
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
    .budgets {
      order: 3;
    }
    .recent {
      order: 4;
    }
    .where {
      order: 5;
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
