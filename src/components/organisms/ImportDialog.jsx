import { useId, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Modal, ModalActions } from "../molecules/Modal";
import { Amount } from "../atoms/Amount";
import { Badge } from "../atoms/Badge";
import { Alert } from "../atoms/Alert";
import { Muted } from "../atoms/Muted";
import { useCategories } from "../../hooks/useCategories";
import { useImportMovements, useMovementsBetween } from "../../hooks/useMovements";
import { useMoney } from "../../hooks/useProfile";
import { MAX_BYTES, planImport, readRows } from "../../utils/csvImport";
import { shortDate } from "../../utils/movements";

// 23503: a category chosen in the mapping was deleted meanwhile (other tab)
const importError = (error) =>
  error?.code === "23503"
    ? "One of the chosen categories no longer exists. Choose again and retry."
    : "Couldn't import the movements. Please try again.";

// Imports a CSV exported from Movements: pick a file, review, import the checked rows
export function ImportDialog({ onClose }) {
  const money = useMoney();
  const rowId = useId();
  const [read, setRead] = useState(null); // readRows() result
  const [picked, setPicked] = useState(() => new Map()); // line → checked, once the user changes it
  const [mapping, setMapping] = useState({}); // unknown category key → "new" | category id
  const fileToken = useRef(0); // ignores a slow read of a file that was replaced meanwhile
  const expense = useCategories("expense");
  const income = useCategories("income");
  const [from, to] = useMemo(() => {
    const dates = read?.rows?.map((r) => r.date).sort() ?? [];
    return [dates[0], dates.at(-1)];
  }, [read]);
  const existing = useMovementsBetween(from, to);
  const save = useImportMovements();

  const plan = useMemo(
    () =>
      read?.rows?.length && expense.data && income.data && existing.data
        ? planImport(read.rows, [...expense.data, ...income.data], existing.data, mapping)
        : null,
    [read, expense.data, income.data, existing.data, mapping]
  );
  // Duplicates start unchecked, the rest checked; the user's choice sticks if the plan recomputes
  const isSelected = (r) => picked.get(r.line) ?? !r.duplicate;
  const selected = new Set(plan?.rows.filter(isSelected).map((r) => r.line));
  const duplicates = plan?.rows.filter((r) => r.duplicate).length ?? 0;
  const loadFailed = expense.isError || income.isError || existing.isError;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const token = ++fileToken.current;
    setPicked(new Map());
    setMapping({});
    save.reset();
    if (!file) return setRead(null);
    if (file.size > MAX_BYTES) return setRead({ fatal: "The file is larger than 1 MB." });
    const text = await file.text();
    if (token === fileToken.current) setRead(readRows(text));
  };

  const toggle = (r) => setPicked((prev) => new Map(prev).set(r.line, !isSelected(r)));

  const handleSubmit = (e) => {
    e.preventDefault();
    save.mutate({ plan, selected, mapping }, { onSuccess: onClose });
  };

  return (
    <Modal title="Import CSV" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <label>
          <span>File exported from Movements</span>
          <FileInput accept=".csv,text/csv" onChange={handleFile} autoFocus />
        </label>

        {read?.fatal && <p role="alert">{read.fatal}</p>}
        {loadFailed && <p role="alert">Couldn't check your categories and movements. Please try again.</p>}
        {read?.rows && !plan && !loadFailed && read.rows.length > 0 && <Muted>Reading…</Muted>}

        {plan && (
          <>
            <Muted aria-live="polite">
              {selected.size} to import · {duplicates} duplicate{duplicates === 1 ? "" : "s"} · {read.errors.length} with errors
            </Muted>

            {plan.unknown.length > 0 && (
              <NewCategories>
                <legend>New categories</legend>
                {plan.unknown.map((u) => (
                  <label key={u.key}>
                    <span>
                      {u.name} <small>{u.type}</small>
                    </span>
                    <select value={mapping[u.key] ?? "new"} onChange={(e) => setMapping({ ...mapping, [u.key]: e.target.value })}>
                      <option value="new">Create it</option>
                      {(u.type === "income" ? income.data : expense.data).map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          Use {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </NewCategories>
            )}

            <Preview>
              <table>
                <tbody>
                  {plan.rows.map((r) => (
                    <tr key={r.line}>
                      <td>
                        <input
                          id={`${rowId}-${r.line}`}
                          type="checkbox"
                          checked={selected.has(r.line)}
                          onChange={() => toggle(r)}
                        />
                      </td>
                      {/* The whole text cell toggles the row and names its checkbox */}
                      <td className="text">
                        <label htmlFor={`${rowId}-${r.line}`}>
                          {r.description ?? r.categoryName}{" "}
                          <small>
                            <span>
                              {r.categoryName} · {shortDate(r.date)}
                            </span>
                            {r.duplicate && <Badge>Duplicate</Badge>}
                          </small>
                        </label>
                      </td>
                      <td className="amount">
                        <Amount $sign={r.type === "income" ? 1 : -1}>{money((r.type === "income" ? 1 : -1) * r.amount)}</Amount>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Preview>
          </>
        )}

        {read?.errors?.length > 0 && (
          <Errors open={read.errors.length <= 5}>
            <summary>
              {read.errors.length} row{read.errors.length === 1 ? "" : "s"} won't be imported
            </summary>
            <ul>
              {read.errors.map((e) => (
                <li key={e.line}>
                  Row {e.line}: {e.message}
                </li>
              ))}
            </ul>
          </Errors>
        )}

        {save.isError && <Alert role="alert">{importError(save.error)}</Alert>}

        <ModalActions>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={!plan || selected.size === 0 || save.isPending}>
            {save.isPending
              ? "Importing…"
              : selected.size
                ? `Import ${selected.size} movement${selected.size === 1 ? "" : "s"}`
                : "Import"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}

const Preview = styled.div`
  max-height: 320px;
  overflow: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  td {
    padding: 8px 12px;
    border-top: 1px solid ${({ theme }) => theme.border};
    vertical-align: middle;
  }
  tr:first-child td {
    border-top: none;
  }
  input {
    width: 16px;
    height: 16px;
  }
  td:first-child {
    padding-right: 0;
  }
  .text {
    width: 100%;
    label {
      display: block;
      cursor: pointer;
    }
    small {
      display: flex;
      flex-wrap: wrap;
      gap: 2px 6px;
      align-items: center;
      color: ${({ theme }) => theme.textMuted};
      font-size: 12px;
    }
    span {
      white-space: nowrap;
    }
  }
  .amount {
    text-align: right;
  }
`;

const NewCategories = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: none;

  legend {
    margin-bottom: 8px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 12px;
    font-size: 14px;
  }
  small {
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
  select {
    height: 36px;
    min-width: 180px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.fieldBorder};
    border-radius: 6px;
    background: ${({ theme }) => theme.bgtotal};
    color: inherit;
    font: inherit;
    font-size: 14px;
  }
`;

/* Native file button themed like ToolButton so the field matches the rest of the form */
const FileInput = styled.input.attrs({ type: "file" })`
  && {
    height: auto;
    padding: 3px;
    color: ${({ theme }) => theme.textMuted};
    cursor: pointer;
  }
  &::file-selector-button {
    height: 28px;
    margin-right: 10px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.fieldBorder};
    border-radius: 4px;
    background: ${({ theme }) => theme.surface};
    color: ${({ theme }) => theme.text};
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  &:hover::file-selector-button {
    background: ${({ theme }) => theme.border};
  }
`;

const Errors = styled.details`
  color: ${({ theme }) => theme.textMuted};
  font-size: 13px;
  summary {
    cursor: pointer;
  }
  ul {
    margin-top: 6px;
    padding-left: 18px;
  }
`;
