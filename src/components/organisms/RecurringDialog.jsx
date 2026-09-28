import { Modal, ModalActions } from "../molecules/Modal";
import { useCategories } from "../../hooks/useCategories";
import { useSaveRecurring } from "../../hooks/useRecurring";
import { repeatLabel } from "../../utils/recurring";

// Amount, category and description of a rule. The schedule is fixed: delete and add it again to change it.
export function RecurringDialog({ rule, onClose }) {
  const save = useSaveRecurring();
  const type = rule.categories.type;
  const { data: categories, isPending, isError } = useCategories(type);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    save.mutate(
      {
        id: rule.id,
        amount: form.get("amount"),
        category_id: Number(form.get("category_id")),
        description: form.get("description").trim() || null,
      },
      { onSuccess: onClose }
    );
  };

  const title = `Edit recurring ${type}`;

  // The <select> is uncontrolled: render it only once its options exist
  if (isPending || isError)
    return (
      <Modal title={title} onClose={onClose}>
        <p role={isError ? "alert" : undefined}>{isError ? "Couldn't load categories." : "Loading…"}</p>
      </Modal>
    );

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <p className="hint">
          {repeatLabel(rule.frequency, rule.anchor)}. Changes apply to the next ones; movements already added stay as
          they are.
        </p>
        <label>
          <span>Amount</span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="9999999999.99"
            step="0.01"
            required
            defaultValue={rule.amount}
            autoFocus
          />
        </label>
        <label>
          <span>Category</span>
          <select name="category_id" required defaultValue={rule.category_id}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Description</span>
          <input name="description" maxLength={200} defaultValue={rule.description ?? ""} />
        </label>

        {save.isError && <p role="alert">Couldn't save the changes. Please try again.</p>}

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
