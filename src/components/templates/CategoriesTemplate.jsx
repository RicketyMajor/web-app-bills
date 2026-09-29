import { useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "motion/react";
import { v } from "../../styles/variables";
import { tileMotion } from "../../styles/motion";
import { monthStart } from "../../utils/movements";
import { categoryErrorMessage, useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { useCategoryBreakdown } from "../../hooks/useReports";
import { useBareMoney } from "../../hooks/useProfile";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { Skeleton } from "../atoms/Skeleton";
import { PageHeader } from "../molecules/PageHeader";
import { LoadError } from "../molecules/LoadError";
import { SegmentedControl } from "../molecules/SegmentedControl";
import { CategoryDialog } from "../organisms/CategoryDialog";
import { IconButton } from "../atoms/IconButton";
import { Muted } from "../atoms/Muted";
import { Alert } from "../atoms/Alert";

const currentMonth = monthStart(new Date());

// "120 of 300 this month" when budgeted; otherwise the plain total
function tileTotal(spent, budget, bare) {
  if (budget) return `${bare(spent ?? 0)} of ${bare(budget)} this month`;
  return spent == null ? "Nothing this month" : `${bare(spent)} this month`;
}

export function CategoriesTemplate() {
  const bare = useBareMoney();
  const [type, setType] = useState("expense");
  const [editing, setEditing] = useState(null); // null = dialog closed
  const categories = useCategories(type);
  const totals = useCategoryBreakdown(currentMonth, type);
  const remove = useDeleteCategory();
  const totalById = new Map(totals.data?.map((r) => [r.id, r.total]));

  const handleDelete = (category) => {
    if (confirm(`Delete "${category.name}"?`)) remove.mutate(category.id);
  };

  return (
    <Container>
      <PageHeader title="Categories">
        <PrimaryButton type="button" onClick={() => setEditing({ type })}>
          <v.agregar aria-hidden="true" />
          New category
        </PrimaryButton>
      </PageHeader>

      <SegmentedControl
        value={type}
        onChange={(t) => {
          setType(t);
          remove.reset();
        }}
      />

      {remove.isError && <Alert role="alert">{categoryErrorMessage(remove.error)}</Alert>}

      {categories.isPending ? (
        <Grid aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} $h={72} />
          ))}
        </Grid>
      ) : categories.isError ? (
        <LoadError message="Couldn't load categories." onRetry={categories.refetch} />
      ) : categories.data.length === 0 ? (
        <Muted>No {type} categories yet.</Muted>
      ) : (
        <Grid as="ul">
          <AnimatePresence>
            {categories.data.map((c, i) => (
              <motion.li key={c.id} {...tileMotion(i)}>
                <CategorySwatch $color={c.color}>{c.icon}</CategorySwatch>
                <div className="body">
                  <span className="name">{c.name}</span>
                  <span className="total">
                    {tileTotal(totalById.get(c.id), c.budget, bare)}
                  </span>
                </div>
                <div className="actions">
                  <IconButton type="button" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                    <v.iconeditarTabla aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(c)}
                    disabled={remove.isPending}
                    aria-label={`Delete ${c.name}`}
                  >
                    <v.iconeliminarTabla aria-hidden="true" />
                  </IconButton>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {editing && <CategoryDialog category={editing} onClose={() => setEditing(null)} />}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 960px;
`;

const Grid = styled.div`
  display: grid;
  /* 260px min: room for the total on one line next to the (hidden) actions */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 10px;
    background: ${({ theme }) => theme.surface};
  }
  .body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .total {
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  /* Hover/focus reveals the tile actions; always visible without a pointer */
  .actions {
    display: flex;
    gap: 2px;
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
`;
