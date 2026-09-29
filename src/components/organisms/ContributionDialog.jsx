import { useId, useState } from "react";
import { Modal, ModalActions } from "../molecules/Modal";
import { SegmentedControl } from "../molecules/SegmentedControl";
import { useAddContribution } from "../../hooks/useGoals";
import { useBareMoney } from "../../hooks/useProfile";
import { isoDate } from "../../utils/movements";
import { canWithdraw } from "../../utils/goals";

const MODES = [
  { value: "add", label: "Add money" },
  { value: "withdraw", label: "Withdraw" },
];

// Money in or out of a goal. Withdrawals can't exceed what's saved (input max + canWithdraw).
export function ContributionDialog({ goal, saved, mode: initialMode, onClose }) {
  const add = useAddContribution();
  const bare = useBareMoney();
  const [mode, setMode] = useState(initialMode);
  const withdraw = mode === "withdraw";
  const hintId = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amount = form.get("amount");
    if (withdraw && !canWithdraw(saved, amount)) return; // the input's max already blocks it
    add.mutate(
      {
        goal_id: goal.id,
        amount: withdraw ? `-${amount}` : amount,
        date: form.get("date"),
        note: form.get("note").trim() || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal title={goal.name} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {/* Nothing saved yet: only adding makes sense */}
        {saved > 0 && <SegmentedControl value={mode} onChange={setMode} options={MODES} label="Add or withdraw" />}
        <label>
          <span>Amount</span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            max={withdraw ? saved : "9999999999.99"}
            step="0.01"
            required
            autoFocus
            aria-describedby={withdraw ? hintId : undefined}
          />
          {withdraw && (
            <small className="hint" id={hintId} aria-hidden="true">
              {bare(saved)} saved in this goal.
            </small>
          )}
        </label>
        <label>
          <span>Date</span>
          <input name="date" type="date" required defaultValue={isoDate(new Date())} />
        </label>
        <label>
          <span>Note (optional)</span>
          <input name="note" maxLength={200} placeholder={withdraw ? "Paid the deposit" : "Bonus"} />
        </label>

        {add.isError && <p role="alert">Couldn't save it. Please try again.</p>}

        <ModalActions>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={add.isPending}>
            {add.isPending ? "Saving…" : withdraw ? "Withdraw" : "Add money"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
