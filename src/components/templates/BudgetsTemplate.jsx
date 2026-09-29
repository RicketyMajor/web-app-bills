import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useMonthStore } from "../../store/monthStore";
import { useCategories } from "../../hooks/useCategories";
import { useBudgetMonth } from "../../hooks/useBudgets";
import { useBareMoney } from "../../hooks/useProfile";
import { budgetRows, overrideKey } from "../../utils/budgets";
import { monthLabel, shiftMonth, toCents } from "../../utils/movements";
import { Card } from "../atoms/Card";
import { Skeleton } from "../atoms/Skeleton";
import { Muted } from "../atoms/Muted";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { ToolButton } from "../atoms/ToolButton";
import { PageHeader } from "../molecules/PageHeader";
import { MonthSelector } from "../molecules/MonthSelector";
import { MonthSlide } from "../molecules/MonthSlide";
import { LoadError } from "../molecules/LoadError";
import { BudgetList } from "../organisms/BudgetList";
import { BudgetDialog } from "../organisms/BudgetDialog";

// Plan each expense category's budget for the selected month
export function BudgetsTemplate() {
  const bare = useBareMoney();
  const month = useMonthStore((s) => s.month);
  const categories = useCategories("expense");
  const data = useBudgetMonth(month);
  const [editing, setEditing] = useState(null); // category id; null = dialog closed

  const monthName = monthLabel(month).split(" ")[0];
  const prevName = monthLabel(shiftMonth(month, -1)).slice(0, 3);
  const rows = categories.data && data.data ? budgetRows(categories.data, month, data.data.overrides, data.data) : null;
  const budgeted = new Set(rows?.map((r) => r.id));
  const unbudgeted = categories.data?.filter((c) => !budgeted.has(c.id)) ?? [];
  const cents = (key) => rows?.reduce((sum, r) => sum + toCents(r[key]), 0) ?? 0;
  const left = (cents("budget") - cents("spent")) / 100;
  const editingCategory = categories.data?.find((c) => c.id === editing);

  return (
    <Container>
      <PageHeader title="Budgets">
        <MonthSelector />
      </PageHeader>

      <MonthSlide>
        {categories.isPending || data.isPending ? (
          <Card aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} $h={48} />
            ))}
          </Card>
        ) : categories.isError || data.isError ? (
          <LoadError
            message="Couldn't load budgets."
            onRetry={() => {
              categories.refetch();
              data.refetch();
            }}
          />
        ) : categories.data.length === 0 ? (
          <Muted>
            No expense categories yet. <Link to="/categories">Add one in Categories</Link>.
          </Muted>
        ) : (
          <Stack>
            {rows.length > 0 ? (
              <>
                <Muted>
                  Budgeted {cents("budget") < 0 && "-"}{bare(cents("budget") / 100)} · Spent {bare(cents("spent") / 100)} · {bare(left)}{" "}
                  {left < 0 ? "over" : "left"}
                </Muted>
                <Card aria-label={`${monthName} budgets`}>
                  <BudgetList rows={rows} prevName={prevName} onEdit={(r) => setEditing(r.id)} />
                </Card>
              </>
            ) : (
              <Muted>No budgets for {monthName} yet. Set one below.</Muted>
            )}

            {unbudgeted.length > 0 && (
              <Card aria-labelledby="nobudget-title">
                <h2 id="nobudget-title">No budget</h2>
                <ul className="plain">
                  {unbudgeted.map((c) => (
                    <li key={c.id}>
                      <CategorySwatch $color={c.color}>{c.icon}</CategorySwatch>
                      <span className="name">{c.name}</span>
                      <ToolButton onClick={() => setEditing(c.id)} aria-label={`Set a budget for ${c.name}`}>
                        Set budget
                      </ToolButton>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </Stack>
        )}
      </MonthSlide>

      {editingCategory && (
        <BudgetDialog
          category={editingCategory}
          month={month}
          override={data.data?.overrides.get(overrideKey(editingCategory.id, month))}
          onClose={() => setEditing(null)}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
  }
  .plain {
    display: flex;
    flex-direction: column;
    gap: 12px;
    list-style: none;
  }
  .plain li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .plain .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
