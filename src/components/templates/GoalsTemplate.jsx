import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { useToday } from "../../hooks/useToday";
import { sortGoals } from "../../utils/goals";
import { useDeleteGoal, useGoals } from "../../hooks/useGoals";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { Card } from "../atoms/Card";
import { Skeleton } from "../atoms/Skeleton";
import { PageHeader } from "../molecules/PageHeader";
import { LoadError } from "../molecules/LoadError";
import { GoalList } from "../organisms/GoalList";
import { GoalDetail } from "../organisms/GoalDetail";
import { GoalDialog } from "../organisms/GoalDialog";
import { ContributionDialog } from "../organisms/ContributionDialog";
import { Muted } from "../atoms/Muted";
import { Alert } from "../atoms/Alert";

// Savings goals (spec 16): list + detail. The selected goal lives in ?goal= (replace: no history entries).
export function GoalsTemplate() {
  const goals = useGoals();
  const removeGoal = useDeleteGoal();
  const [params, setParams] = useSearchParams();
  const [dialog, setDialog] = useState(null); // null | { kind: "goal", goal } | { kind: "contribution", mode, goal, progress }
  const detailRef = useRef(null);
  const today = useToday();

  const { active, reached } = goals.data ? sortGoals(goals.data, today) : { active: [], reached: [] };
  const all = [...active, ...reached];
  // Unknown or missing id (deleted goal, old link) falls back to the first goal
  const selected = all.find((x) => String(x.goal.id) === params.get("goal")) ?? all[0];

  const select = (id) => {
    removeGoal.reset();
    setParams({ goal: String(id) }, { replace: true });
    // When the layout stacks (container query), the detail sits below the list: bring it into view
    const detail = detailRef.current;
    if (detail && detail.offsetTop > detail.previousElementSibling.offsetTop)
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = (goal) => {
    if (!confirm(`Delete ${goal.name}? Its history goes too.`)) return;
    removeGoal.reset();
    removeGoal.mutate(goal.id);
  };

  return (
    <Container>
      <PageHeader title="Goals">
        <PrimaryButton type="button" onClick={() => setDialog({ kind: "goal", goal: {} })}>
          <v.agregar aria-hidden="true" />
          New goal
        </PrimaryButton>
      </PageHeader>

      {removeGoal.isError && <Alert role="alert">Couldn't delete the goal. Please try again.</Alert>}

      {goals.isPending ? (
        <Layout aria-busy="true">
          <Card>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} $h={44} />
            ))}
          </Card>
          <Card>
            <Skeleton $h={28} $w="40%" />
            <Skeleton $h={40} />
            <Skeleton $h={120} />
          </Card>
        </Layout>
      ) : goals.isError ? (
        <LoadError message="Couldn't load your goals." onRetry={goals.refetch} />
      ) : all.length === 0 ? (
        <Muted>No goals yet. Create one to start saving toward something.</Muted>
      ) : (
        <Layout>
          <GoalList active={active} reached={reached} selectedId={selected.goal.id} onSelect={select} />
          <div ref={detailRef} className="detail">
            <GoalDetail
              key={selected.goal.id}
              goal={selected.goal}
              progress={selected.progress}
              onAdd={() => setDialog({ kind: "contribution", mode: "add", ...selected })}
              onWithdraw={() => setDialog({ kind: "contribution", mode: "withdraw", ...selected })}
              onEdit={() => setDialog({ kind: "goal", goal: selected.goal })}
              onDelete={() => handleDelete(selected.goal)}
              deleting={removeGoal.isPending}
            />
          </div>
        </Layout>
      )}

      {dialog?.kind === "goal" && (
        <GoalDialog goal={dialog.goal} onClose={() => setDialog(null)} onSaved={(id) => select(id)} />
      )}
      {dialog?.kind === "contribution" && (
        <ContributionDialog
          goal={dialog.goal}
          saved={dialog.progress.saved}
          mode={dialog.mode}
          onClose={() => setDialog(null)}
        />
      )}
    </Container>
  );
}

// container-type here: Layout's @container rule measures the room beside the sidebar
const Container = styled.div`
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 960px;
`;

// List + detail; stacked when that room is narrow
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
  align-items: start;
  gap: 20px;

  @container (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
  .detail {
    min-width: 0;
    scroll-margin-top: 16px;
  }
`;
