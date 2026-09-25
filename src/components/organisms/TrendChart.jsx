import styled from "styled-components";
import { v } from "../../styles/variables";
import { formatMoney } from "../../utils/formatMoney";
import { monthLabel } from "../../utils/movements";

const shortMonth = (m) => monthLabel(m).slice(0, 3);

// Income up, expenses down from a shared zero baseline (one axis).
// Position tells the two apart; green/red alone fails colour-blind separation.
export function TrendChart({ data, current }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const pct = (value) => `${(value / max) * 100}%`;

  return (
    <Figure>
      <Legend>
        <span>
          <i style={{ background: v.colorIngresos }} /> Income (up)
        </span>
        <span>
          <i style={{ background: v.colorGastos }} /> Expenses (down)
        </span>
      </Legend>

      <Columns>
        {data.map((d) => (
          <li
            key={d.month}
            tabIndex={0}
            className={d.month === current ? "current" : undefined}
            aria-label={`${monthLabel(d.month)}: income ${formatMoney(d.income)}, expenses ${formatMoney(-d.expense)}, net ${formatMoney(d.income - d.expense)}`}
          >
            <div className="half up">
              <Bar $color={v.colorIngresos} style={{ height: pct(d.income) }} />
            </div>
            <div className="half down">
              <Bar $color={v.colorGastos} style={{ height: pct(d.expense) }} />
            </div>
            <span className="label" aria-hidden="true">
              {shortMonth(d.month)}
            </span>
            <Tip className="tip" aria-hidden="true">
              <strong>{monthLabel(d.month)}</strong>
              <span>Income {formatMoney(d.income)}</span>
              <span>Expenses {formatMoney(-d.expense)}</span>
              <span>Net {formatMoney(d.income - d.expense)}</span>
            </Tip>
          </li>
        ))}
      </Columns>

      <details>
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Income</th>
              <th scope="col">Expenses</th>
              <th scope="col">Net</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month}>
                <th scope="row">{monthLabel(d.month)}</th>
                <td>{formatMoney(d.income)}</td>
                <td>{formatMoney(-d.expense)}</td>
                <td>{formatMoney(d.income - d.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Figure>
  );
}

const Figure = styled.figure`
  display: flex;
  flex-direction: column;
  gap: 16px;

  details summary {
    width: fit-content;
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
    cursor: pointer;
  }
  table {
    width: 100%;
    margin-top: 8px;
    border-collapse: collapse;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    padding: 6px 8px;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: right;
  }
  th[scope="row"],
  thead th:first-child {
    text-align: left;
    font-weight: 500;
  }
  thead th {
    color: ${({ theme }) => theme.textMuted};
    font-weight: 500;
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.textMuted};
  font-size: 12px;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  i {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
`;

// Each focusable column carries its values in aria-label; the table is the full twin.
const Columns = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  list-style: none;

  li {
    position: relative;
    display: grid;
    grid-template-rows: 96px 96px auto;
    justify-items: center;
    border-radius: 8px;
    outline-offset: -2px;
    cursor: default;
  }
  li:hover,
  li:focus-visible {
    background: ${({ theme }) => theme.border};
  }
  .half {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  /* Surface gap on each side of the zero baseline */
  .up {
    align-items: flex-end;
    padding-bottom: 1px;
    border-bottom: 1px solid ${({ theme }) => theme.textMuted};
  }
  .down {
    align-items: flex-start;
    padding-top: 2px;
  }
  .up > * {
    border-radius: 4px 4px 0 0;
  }
  .down > * {
    border-radius: 0 0 4px 4px;
  }
  .label {
    padding: 6px 0;
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
  .current .label {
    color: ${({ theme }) => theme.text};
    font-weight: 600;
  }
  /* Keep the last tooltips inside the card */
  li:nth-last-child(-n + 2) .tip {
    left: auto;
    right: 0;
    transform: none;
  }
`;

const Bar = styled.div`
  width: min(24px, 40%);
  background: ${({ $color }) => $color};
`;

const Tip = styled.div`
  position: absolute;
  z-index: 1;
  top: 8px;
  left: 50%;
  display: none;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transform: translateX(-50%);
  pointer-events: none;

  li:hover > &,
  li:focus-visible > & {
    display: flex;
  }
`;
