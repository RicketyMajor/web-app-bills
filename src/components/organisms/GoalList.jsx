import styled from "styled-components";
import { RiCheckLine } from "react-icons/ri";

// Left column of /goals: active goals, then a Reached group. Rows are buttons; the bar is decorative (the % says it).
export function GoalList({ active, reached, selectedId, onSelect }) {
  const row = ({ goal, progress }) => (
    <li key={goal.id}>
      <button
        type="button"
        aria-current={goal.id === selectedId ? "true" : undefined}
        onClick={() => onSelect(goal.id)}
      >
        <span className="icon" aria-hidden="true">
          {goal.icon}
        </span>
        <span className="name">{goal.name}</span>
        <span className="pct">
          {progress.reached ? (
            <>
              <RiCheckLine aria-hidden="true" />
              <span className="sr-only">Reached</span>
            </>
          ) : (
            `${progress.percent}%`
          )}
        </span>
        <span className="bar" aria-hidden="true">
          <span style={{ width: `${Math.min(progress.ratio, 1) * 100}%` }} />
        </span>
      </button>
    </li>
  );

  return (
    <Nav aria-label="Goals">
      <ul>{active.map(row)}</ul>
      {reached.length > 0 && (
        <>
          <h2>Reached</h2>
          <ul>{reached.map(row)}</ul>
        </>
      )}
    </Nav>
  );
}

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  ul {
    display: flex;
    flex-direction: column;
    gap: 2px;
    list-style: none;
  }
  h2 {
    margin-top: 12px;
    padding: 0 12px;
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
    font-weight: 500;
  }
  button {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) auto;
    grid-template-areas: "icon name pct" "icon bar bar";
    align-items: center;
    gap: 4px 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background: none;
    color: ${({ theme }) => theme.text};
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color 150ms;

    &:hover {
      background: ${({ theme }) => theme.border};
    }
    &[aria-current="true"] {
      background: ${({ theme }) => theme.accentSoft};
    }
  }
  .icon {
    display: grid;
    grid-area: icon;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${({ theme }) => theme.border};
    font-size: 17px;
  }
  .name {
    grid-area: name;
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pct {
    display: inline-flex;
    grid-area: pct;
    align-items: center;
    /* Not textMuted: the selected row sits on accentSoft (textMuted there is 4.2:1 in light) */
    color: color-mix(in srgb, ${({ theme }) => theme.text} 72%, transparent);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .bar {
    grid-area: bar;
    height: 3px;
    overflow: hidden;
    border-radius: 2px;
    background: ${({ theme }) => theme.border};
  }
  .bar > span {
    display: block;
    height: 100%;
    background: ${({ theme }) => theme.accent};
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
`;
