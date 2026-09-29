import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, ModalActions } from "../molecules/Modal";
import { useCategories } from "../../hooks/useCategories";
import { useSaveMovement } from "../../hooks/useMovements";
import { useAddRecurring } from "../../hooks/useRecurring";
import { repeatLabel } from "../../utils/recurring";

const REPEATS = [
  { value: "", label: "Never" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Create (no movement.id) or edit a movement of movement.type. Mount it to open it.
export function MovementDialog({ movement, onClose }) {
  const save = useSaveMovement();
  const addRecurring = useAddRecurring();
  const hintId = useId();
  // Repeat is offered only when creating; its hint follows the chosen date
  const [repeat, setRepeat] = useState("");
  const [date, setDate] = useState(movement.date);
  // Unpaid: the date is when it's due
  const [paid, setPaid] = useState(movement.paid ?? true);
  const { data: categories, isPending, isError } = useCategories(movement.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fields = {
      amount: form.get("amount"),
      date: form.get("date"),
      category_id: Number(form.get("category_id")),
      description: form.get("description").trim() || null,
      paid: form.get("paid") === "on",
    };
    if (repeat) addRecurring.mutate({ ...fields, frequency: repeat }, { onSuccess: onClose });
    else save.mutate({ id: movement.id, ...fields }, { onSuccess: onClose });
  };
  const busy = save.isPending || addRecurring.isPending;

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
          <span>{paid ? "Date" : "Due date"}</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={movement.date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        {!movement.id && (
          <label>
            <span>Repeat</span>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              aria-describedby={repeat && date ? hintId : undefined}
            >
              {REPEATS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {repeat && date && (
              <small className="hint" id={hintId} aria-hidden="true">
                {repeatLabel(repeat, date)}
                {repeat === "monthly" && Number(date.slice(8)) > 28 && " (last day in shorter months)"}. Added as
                pending each time.
              </small>
            )}
          </label>
        )}

        <label>
          <span>Description</span>
          <input name="description" maxLength={200} defaultValue={movement.description ?? ""} />
        </label>

        <label className="check">
          <input name="paid" type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          <span>Paid</span>
        </label>

        {(save.isError || addRecurring.isError) && <p role="alert">Couldn't save the movement. Please try again.</p>}

        <ModalActions>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
