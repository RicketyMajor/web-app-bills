import { useEffect, useId, useRef } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";

// Native modal <dialog>. Mount it to open it; Escape / onClose unmounts it.
export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal(); // StrictMode runs effects twice
  }, []);

  return (
    <Dialog ref={ref} onClose={onClose} aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </Dialog>
  );
}

const Dialog = styled.dialog`
  width: min(400px, calc(100% - 32px));
  margin: auto; /* the global reset removes the native centering */
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};

  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
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
    height: 40px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 8px;
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
    height: 40px;
    padding: 0 16px;
    border: none;
    border-radius: 8px;
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
    color: ${({ theme }) => theme.body};
  }
`;
