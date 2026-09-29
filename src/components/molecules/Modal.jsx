import { useEffect, useId, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { v } from "../../styles/variables";

// Native modal <dialog>. Mount it to open it; Escape / onClose unmounts it.
export function Modal({ title, onClose, wide, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal(); // StrictMode runs effects twice
  }, []);

  return (
    <Dialog ref={ref} onClose={onClose} aria-labelledby={titleId} $wide={wide}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </Dialog>
  );
}

const modalIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
`;
const backdropIn = keyframes`
  from { opacity: 0; }
`;

const Dialog = styled.dialog`
  width: min(${({ $wide }) => ($wide ? "720px" : "400px")}, calc(100% - 32px));
  margin: auto; /* the global reset removes the native centering */
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  /* The only shadow in the system: the modal needs lift over the page */
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);

  &::backdrop {
    background: rgba(12, 12, 14, 0.45);
  }
  @media (prefers-reduced-motion: no-preference) {
    &[open] {
      animation: ${modalIn} 220ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    &[open]::backdrop {
      animation: ${backdropIn} 200ms ease-out;
    }
  }

  h2 {
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    &::first-letter {
      text-transform: uppercase;
    }
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  form > label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  form > label > span,
  summary > span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  form > label > input,
  form > label > select {
    height: 36px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 6px;
    background: ${({ theme }) => theme.bgtotal};
    color: inherit;
    font: inherit;
    font-size: 14px;
  }
  input[type="color"] {
    padding: 4px;
    cursor: pointer;
  }
  form > label.check {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  form > label.check > input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.accent};
  }
  form > label.check > span {
    color: inherit;
    font-size: 14px;
    letter-spacing: 0;
    text-transform: none;
  }
  /* A check with a hint below its text: box aligns with the first line */
  form > label.check:has(.hint) {
    align-items: flex-start;
  }
  form > label.check:has(.hint) > input {
    margin-top: 2px;
  }
  form > label.check .hint {
    display: block;
    margin-top: 2px;
  }
  .hint {
    color: ${({ theme }) => theme.textMuted};
    font-size: 13px;
  }
  p[role="alert"] {
    color: ${v.colorError};
    font-size: 14px;
  }
`;

// Footer row for the form's buttons; `.primary` is the accent button
export function ModalActions({ children }) {
  return <Actions>{children}</Actions>;
}

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    background: none;
    color: ${({ theme }) => theme.textMuted};
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 150ms, color 150ms;

    &:hover {
      background: ${({ theme }) => theme.border};
      color: ${({ theme }) => theme.text};
    }
    &:active {
      transform: scale(0.97);
    }
    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
  .primary,
  .primary:hover {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.onAccent};
  }
  /* Dark text: white on the expense red is ~3:1, fails AA at 14px */
  .danger:not(:disabled),
  .danger:not(:disabled):hover {
    background: ${v.colorGastos};
    color: #1c1c1e;
  }
`;
