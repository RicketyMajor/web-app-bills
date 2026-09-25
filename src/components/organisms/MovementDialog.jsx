import { Link } from "react-router-dom";
import { Modal, ModalActions } from "../molecules/Modal";
import { useCategories } from "../../hooks/useCategories";
import { useSaveMovement } from "../../hooks/useMovements";

// Create (no movement.id) or edit a movement of movement.type. Mount it to open it.
export function MovementDialog({ movement, onClose }) {
  const save = useSaveMovement();
  const { data: categories, isPending, isError } = useCategories(movement.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    save.mutate(
      {
        id: movement.id,
        amount: form.get("amount"),
        date: form.get("date"),
        category_id: Number(form.get("category_id")),
        description: form.get("description").trim() || null,
        paid: form.get("paid") === "on",
      },
      { onSuccess: onClose }
    );
  };

  const title = `${movement.id ? "Edit" : "New"} ${movement.type}`;

  // The <select> is uncontrolled: render it only once its options exist
  if (isPending || isError)
    return (
      <Modal title={title} onClose={onClose}>
        <p role={isError ? "alert" : undefined}>
          {isError ? "Couldn't load categories." : "Loading…"}
        </p>
      </Modal>
    );

  if (categories.length === 0)
    return (
      <Modal title={title} onClose={onClose}>
        <p>
          You have no {movement.type} categories yet.{" "}
          <Link to="/categories" onClick={onClose}>
            Create one
          </Link>{" "}
          first.
        </p>
      </Modal>
    );

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
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
            defaultValue={movement.amount}
            autoFocus
          />
        </label>

        <label>
          <span>Category</span>
          <select name="category_id" required defaultValue={movement.category_id ?? ""}>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Date</span>
          <input name="date" type="date" required defaultValue={movement.date} />
        </label>

        <label>
          <span>Description</span>
          <input name="description" maxLength={200} defaultValue={movement.description ?? ""} />
        </label>

        <label className="check">
          <input name="paid" type="checkbox" defaultChecked={movement.paid ?? true} />
          <span>Paid</span>
        </label>

        {save.isError && <p role="alert">Couldn't save the movement. Please try again.</p>}

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
