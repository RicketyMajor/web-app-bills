import { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { categoryErrorMessage, useSaveCategory } from "../../hooks/useCategories";
import { Modal, ModalActions } from "../molecules/Modal";

// Curated picker set; free text isn't allowed
const EMOJIS = [
  "💼", "💰", "💵", "💳", "🏦", "📈", "🎁", "🪙", "💸",
  "🍔", "🍕", "🛒", "☕", "🍺", "🍎", "🍽️",
  "🚌", "🚗", "⛽", "✈️", "🚲", "🚕", "🚆",
  "🏠", "💡", "💧", "🔥", "📶", "🛋️", "🧹", "🔧",
  "💊", "🏥", "🦷", "🏋️",
  "🎮", "🎬", "🎵", "📚", "🎨", "⚽", "🏖️", "🎉",
  "👕", "👟", "💄", "📱", "💻",
  "🐶", "👶", "🎓", "✂️", "🧸", "🛡️", "🧾", "📁",
];

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

        <Picker>
          <summary>
            <span>Emoji</span>
            <strong aria-hidden="true">{icon}</strong>
            <v.iconoFlechabajo aria-hidden="true" className="chevron" />
          </summary>
          <fieldset>
            <legend>Choose an emoji</legend>
            {EMOJIS.map((e) => (
              <label key={e}>
                <input
                  type="radio"
                  name="icon"
                  value={e}
                  checked={icon === e}
                  onChange={() => setIcon(e)}
                />
                <span>{e}</span>
              </label>
            ))}
          </fieldset>
        </Picker>

        <label>
          <span>Color</span>
          <input name="color" type="color" defaultValue={category.color ?? "#9046FF"} />
        </label>

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

// <details> accordion with a radio grid: keyboard arrows move the selection natively
const Picker = styled.details`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.bgtotal};

  summary {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0 12px;
    list-style: none;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }
    strong {
      font-size: 20px;
      font-weight: 400;
    }
    .chevron {
      margin-left: auto;
      color: ${({ theme }) => theme.textMuted};
      transition: transform 150ms;
    }
  }
  &[open] .chevron {
    transform: rotate(180deg);
  }

  fieldset {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 4px;
    max-height: 184px;
    overflow-y: auto;
    padding: 8px;
    border: none;
    border-top: 1px solid ${({ theme }) => theme.border};
  }
  legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  label {
    position: relative;
    display: grid;
    place-items: center;
    height: 40px;
    border-radius: 8px;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 150ms;

    &:hover {
      background: ${({ theme }) => theme.border};
    }
    &:has(input:checked) {
      background: ${({ theme }) => theme.accentSoft};
      box-shadow: inset 0 0 0 2px ${({ theme }) => theme.accent};
    }
    &:has(input:focus-visible) {
      outline: 2px solid ${({ theme }) => theme.accent};
      outline-offset: 2px;
    }
  }
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
`;

