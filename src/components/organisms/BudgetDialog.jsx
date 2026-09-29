import { useId } from "react";
import { Modal, ModalActions } from "../molecules/Modal";
import { useSaveBudget } from "../../hooks/useBudgets";
import { monthName } from "../../utils/movements";

const MONEY = { type: "number", inputMode: "decimal", min: "0.01", max: "9999999999.99", step: "0.01" };

// One category's budget: the usual monthly cap, this month's exception and the rollover switch
export function BudgetDialog({ category, month, override, onClose }) {
  const save = useSaveBudget();
  const monthLong = monthName(month);
  const hintId = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    save.mutate(
      {
        categoryId: category.id,
        month,
        budget: form.get("budget") || null,
        override: form.get("override") || null,
        rollover: form.get("rollover") === "on",
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal title={`${category.name} budget`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Monthly budget</span>
          <input name="budget" {...MONEY} defaultValue={category.budget ?? ""} placeholder="No budget" autoFocus aria-describedby={`${hintId}-budget`} />
          <small className="hint" id={`${hintId}-budget`} aria-hidden="true">
            Applies every month.
          </small>
        </label>
        <label>
          <span>{monthLong} only</span>
          <input name="override" {...MONEY} defaultValue={override ?? ""} placeholder="Same as monthly" aria-describedby={`${hintId}-override`} />
          <small className="hint" id={`${hintId}-override`} aria-hidden="true">
            Leave empty to use the monthly budget.
          </small>
        </label>
        <label className="check">
          <input name="rollover" type="checkbox" defaultChecked={category.rollover} aria-describedby={`${hintId}-rollover`} />
          <span>
            Roll over from last month
            <small className="hint" id={`${hintId}-rollover`} aria-hidden="true">
              Adds what was left last month, or takes off what went over.
            </small>
          </span>
        </label>

        {save.isError && <p role="alert">Couldn't save the budget. Please try again.</p>}

        <ModalActions>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
