import styled from "styled-components";
import { v } from "../../styles/variables";
import { EMOJIS } from "../../utils/emojis";

// <details> accordion with a radio grid (name="icon"): keyboard arrows move the selection natively.
// Lives inside a Modal form (its summary > span gets the field-label style there).
export function EmojiPicker({ value, onChange }) {
  return (
    <Picker>
      <summary>
        <span>Emoji</span>
        <strong aria-hidden="true">{value}</strong>
        <v.iconoFlechabajo aria-hidden="true" className="chevron" />
      </summary>
      <fieldset>
        <legend className="sr-only">Choose an emoji</legend>
        {EMOJIS.map((e) => (
          <label key={e}>
            <input type="radio" name="icon" value={e} checked={value === e} onChange={() => onChange(e)} />
            <span>{e}</span>
          </label>
        ))}
      </fieldset>
    </Picker>
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
