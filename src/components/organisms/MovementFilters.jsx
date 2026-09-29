import { useId, useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { useCategories } from "../../hooks/useCategories";
import { activeFilterCount } from "../../utils/movements";
import { ToolButton } from "../atoms/ToolButton";

// Search stays visible; the other filters fold into a panel below the bar.
// values are strings ("" = off; the page mirrors them to the URL); children go at the end of the bar.
export function MovementFilters({ type, values, onChange, onClear, children }) {
  const count = activeFilterCount(values);
  const [open, setOpen] = useState(count > 0);
  const panelId = useId();
  const categories = useCategories(type);

  return (
    <Wrap>
      <div className="bar">
        <input
          type="search"
          className="search"
          aria-label="Search movements"
          placeholder="Search movements"
          value={values.q}
          onChange={(e) => onChange("q", e.target.value)}
        />
        <ToolButton aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
          Filters{count > 0 && ` (${count})`}
          <v.iconoFlechabajo aria-hidden="true" />
        </ToolButton>
        {children}
      </div>

      {open && (
        <div id={panelId} className="panel">
          <label>
            <span>Category</span>
            <select value={values.cat} onChange={(e) => onChange("cat", e.target.value)}>
              <option value="">All categories</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={values.status} onChange={(e) => onChange("status", e.target.value)}>
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </label>
          <label>
            <span>Min amount</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              value={values.min}
              onChange={(e) => onChange("min", e.target.value)}
            />
          </label>
          <label>
            <span>Max amount</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              value={values.max}
              onChange={(e) => onChange("max", e.target.value)}
            />
          </label>
          <div className="foot">
            <label className="check">
              <input
                type="checkbox"
                checked={values.all === "1"}
                onChange={(e) => onChange("all", e.target.checked ? "1" : "")}
              />
              <span>All months</span>
            </label>
            <button type="button" className="clear" onClick={onClear} disabled={count === 0 && !values.q}>
              Clear filters
            </button>
          </div>
        </div>
      )}
    </Wrap>
  );
}

// Container queries: the room next to the sidebar decides the layout, not the viewport
const Wrap = styled.div`
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  input,
  select {
    height: 36px;
    min-width: 0;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.fieldBorder};
    border-radius: 6px;
    background: ${({ theme }) => theme.surface};
    color: inherit;
    font: inherit;
    font-size: 14px;
  }
  .search {
    flex: 1 1 240px;
  }
  .panel {
    display: grid;
    /* Two pairs (category/status, min/max) on narrow widths, one row of four when it fits */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 16px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 10px;
    background: ${({ theme }) => theme.surface};
  }
  .panel label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .panel label > span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  /* Fields on a surface use the canvas so they read as fields */
  .panel input,
  .panel select {
    background: ${({ theme }) => theme.bgtotal};
  }
  .foot {
    display: flex;
    flex-wrap: wrap;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .panel label.check {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .panel label.check > span {
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }
  .panel .check input {
    width: 16px;
    height: 16px;
    padding: 0;
  }
  .clear {
    height: 36px;
    padding: 0 4px;
    border: none;
    background: none;
    color: ${({ theme }) => theme.textMuted};
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.text};
    }
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
  @container (min-width: 640px) {
    .panel {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  /* Narrow: search on its own line, Filters (+ Export) below */
  @container (max-width: 480px) {
    .search {
      flex-basis: 100%;
    }
  }
`;
