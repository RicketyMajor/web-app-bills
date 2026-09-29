import { useState } from "react";
import { Modal, ModalActions } from "../molecules/Modal";
import { EmojiPicker } from "../molecules/EmojiPicker";
import { EMOJIS } from "../../utils/emojis";
import { useSaveGoal } from "../../hooks/useGoals";

// Create (no goal.id) or edit a goal. onSaved(id) lets the page select a new goal.
export function GoalDialog({ goal, onClose, onSaved }) {
  const save = useSaveGoal();
  const isNew = !goal.id;
  const [icon, setIcon] = useState(EMOJIS.includes(goal.icon) ? goal.icon : "🎯");

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    save.mutate(
      {
        id: goal.id,
        name: form.get("name").trim(),
        icon,
        target: form.get("target"),
        deadline: form.get("deadline") || null,
      },
      {
        onSuccess: (id) => {
          onSaved?.(id);
          onClose();
        },
      }
    );
  };

  return (
    <Modal title={isNew ? "New goal" : "Edit goal"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            name="name"
            defaultValue={goal.name}
            required
            pattern=".*\S.*"
            title="Name can't be only spaces"
            maxLength={50}
            placeholder="Japan trip"
            autoFocus
          />
        </label>
        <EmojiPicker value={icon} onChange={setIcon} />
        <label>
          <span>Target</span>
          <input
            name="target"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="9999999999.99"
            step="0.01"
            required
            defaultValue={goal.target}
          />
        </label>
        <label>
          <span>Deadline (optional)</span>
          <input name="deadline" type="date" defaultValue={goal.deadline ?? ""} />
        </label>

        {save.isError && <p role="alert">Couldn't save the goal. Please try again.</p>}

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
