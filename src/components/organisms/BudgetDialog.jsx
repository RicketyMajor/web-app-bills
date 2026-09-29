import { Modal, ModalActions } from "../molecules/Modal";
import { useSaveBudget } from "../../hooks/useBudgets";
import { monthLabel } from "../../utils/movements";

const MONEY = { type: "number", inputMode: "decimal", min: "0.01", max: "9999999999.99", step: "0.01" };

// One category's budget: the usual monthly cap, this month's exception and the rollover switch
export function BudgetDialog({ category, month, override, onClose }) {
  const save = useSaveBudget();
  const monthName = monthLabel(month).split(" ")[0];

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
          <input name="budget" {...MONEY} defaultValue={category.budget ?? ""} placeholder="No budget" autoFocus />
          <small className="hint">Applies every month.</small>
        </label>
        <label>
          <span>{monthName} only</span>
          <input name="override" {...MONEY} defaultValue={override ?? ""} placeholder="Same as monthly" />
          <small className="hint">Leave empty to use the monthly budget.</small>
        </label>
        <label className="check">
          <input name="rollover" type="checkbox" defaultChecked={category.rollover} />
          <span>
            Roll over from last month
            <small className="hint">Adds what was left last month, or takes off what went over.</small>
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
