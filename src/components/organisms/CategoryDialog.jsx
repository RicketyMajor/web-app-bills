import { useState } from "react";
import { categoryErrorMessage, useSaveCategory } from "../../hooks/useCategories";
import { Modal, ModalActions } from "../molecules/Modal";
import { EmojiPicker } from "../molecules/EmojiPicker";
import { EMOJIS } from "../../utils/emojis";

// Modal form to create (no category.id) or edit a category. Mount it to open it.
export function CategoryDialog({ category, onClose }) {
  const save = useSaveCategory();
  const isNew = !category.id;
  // Icons outside the set (e.g. old free-text values) fall back to the default
  const [icon, setIcon] = useState(EMOJIS.includes(category.icon) ? category.icon : "📁");

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    save.mutate(
      {
        id: category.id,
        type: category.type,
        name: form.name.trim(),
        icon: form.icon,
        color: form.color,
        budget: form.budget || null, // income dialogs have no field → null
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal title={`${isNew ? "New" : "Edit"} ${category.type} category`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            name="name"
            defaultValue={category.name}
            required
            pattern=".*\S.*"
            title="Name can't be only spaces"
            maxLength={50}
            autoFocus
          />
        </label>

        <EmojiPicker value={icon} onChange={setIcon} />

        <label>
          <span>Color</span>
          <input name="color" type="color" defaultValue={category.color ?? "#9046FF"} />
        </label>

        {category.type === "expense" && (
          <label>
            <span>Monthly budget</span>
            <input
              name="budget"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              placeholder="No limit"
              defaultValue={category.budget ?? ""}
            />
          </label>
        )}

        {save.isError && <p role="alert">{categoryErrorMessage(save.error)}</p>}

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
