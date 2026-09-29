import { useState } from "react";
import styled from "styled-components";
import { useMonthStore } from "../../store/monthStore";
import { useCategoryBreakdown, useMonthlyTrend } from "../../hooks/useReports";
import { monthLabel } from "../../utils/movements";
import { useToday } from "../../hooks/useToday";
import { compareLabel } from "../../utils/reports";
import { Card } from "../atoms/Card";
import { Skeleton } from "../atoms/Skeleton";
import { PageHeader } from "../molecules/PageHeader";
import { LoadError } from "../molecules/LoadError";
import { MonthSelector } from "../molecules/MonthSelector";
import { MonthSlide } from "../molecules/MonthSlide";
import { SegmentedControl } from "../molecules/SegmentedControl";
import { TrendChart } from "../organisms/TrendChart";
import { CategoryBreakdown } from "../organisms/CategoryBreakdown";
import { Muted } from "../atoms/Muted";

export function ReportsTemplate() {
  const today = useToday();
  const month = useMonthStore((s) => s.month);
  const [type, setType] = useState("expense");
  const trend = useMonthlyTrend(month);
  const breakdown = useCategoryBreakdown(month, type);

  const trendEmpty = trend.data?.every((d) => d.income === 0 && d.expense === 0);

  return (
    <Container>
      <PageHeader title="Reports">
        <MonthSelector />
      </PageHeader>

      <MonthSlide className="stack">
        <Card aria-labelledby="trend-title" aria-busy={trend.isPending}>
          <h2 id="trend-title">Last 6 months</h2>
          {trend.isPending ? (
            <Skeleton $h={200} />
          ) : trend.isError ? (
            <LoadError message="Couldn't load the trend." onRetry={trend.refetch} />
          ) : trendEmpty ? (
            <Muted>No movements in the last 6 months.</Muted>
          ) : (
            <TrendChart data={trend.data} current={month} />
          )}
        </Card>

        <Card aria-labelledby="breakdown-title" aria-busy={breakdown.isPending}>
          <div className="head">
            <h2 id="breakdown-title">By category · {monthLabel(month)}</h2>
            <SegmentedControl value={type} onChange={setType} />
          </div>
          {breakdown.isPending ? (
            [0, 1, 2].map((i) => <Skeleton key={i} $h={36} />)
          ) : breakdown.isError ? (
            <LoadError message="Couldn't load categories." onRetry={breakdown.refetch} />
          ) : breakdown.data.length === 0 ? (
            <Muted>No {type === "income" ? "income" : "expenses"} this month.</Muted>
          ) : (
            <CategoryBreakdown rows={breakdown.data} compare={compareLabel(month, today)} />
          )}
        </Card>
      </MonthSlide>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 960px;

  .stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;
