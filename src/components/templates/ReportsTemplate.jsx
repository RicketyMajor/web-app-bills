import { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { useMonthStore } from "../../store/monthStore";
import { useCategoryBreakdown, useMonthlyTrend } from "../../hooks/useReports";
import { monthLabel } from "../../utils/movements";
import { MonthSelector } from "../molecules/MonthSelector";
import { TypeTabs } from "../molecules/TypeTabs";
import { TrendChart } from "../organisms/TrendChart";
import { CategoryBreakdown } from "../organisms/CategoryBreakdown";

export function ReportsTemplate() {
  const month = useMonthStore((s) => s.month);
  const [type, setType] = useState("expense");
  const trend = useMonthlyTrend(month);
  const breakdown = useCategoryBreakdown(month, type);

  const trendEmpty = trend.data?.every((d) => d.income === 0 && d.expense === 0);

  return (
    <Container>
      <Header>
        <h1>Reports</h1>
        <MonthSelector />
      </Header>

      <Card aria-labelledby="trend-title" $dim={trend.isFetching && !trend.isPending}>
        <h2 id="trend-title">Last 6 months</h2>
        {trend.isPending ? (
          <Muted>Loading…</Muted>
        ) : trend.isError ? (
          <Alert role="alert">Couldn't load the trend.</Alert>
        ) : trendEmpty ? (
          <Muted>No movements in the last 6 months.</Muted>
        ) : (
          <TrendChart data={trend.data} current={month} />
        )}
      </Card>

      <Card aria-labelledby="breakdown-title" $dim={breakdown.isFetching && !breakdown.isPending}>
        <div className="head">
          <h2 id="breakdown-title">By category · {monthLabel(month)}</h2>
          <TypeTabs value={type} onChange={setType} />
        </div>
        {breakdown.isPending ? (
          <Muted>Loading…</Muted>
        ) : breakdown.isError ? (
          <Alert role="alert">Couldn't load categories.</Alert>
        ) : breakdown.data.length === 0 ? (
          <Muted>No {type === "income" ? "income" : "expenses"} this month.</Muted>
        ) : (
          <CategoryBreakdown rows={breakdown.data} />
        )}
      </Card>
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

// Refetch keeps the previous render at reduced opacity (no skeleton flash)
const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  opacity: ${({ $dim }) => ($dim ? 0.6 : 1)};
  transition: opacity 150ms;

  h2 {
    font-size: 16px;
    font-weight: 600;
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
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
