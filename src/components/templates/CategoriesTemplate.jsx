import { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { CategoryDialog } from "../organisms/CategoryDialog";
import {
  categoryErrorMessage,
  useCategories,
  useDeleteCategory,
} from "../../hooks/useCategories";

const tabs = [
  { type: "expense", label: "Expenses" },
  { type: "income", label: "Income" },
];

export function CategoriesTemplate() {
  const [type, setType] = useState("expense");
  const [editing, setEditing] = useState(null); // null = dialog closed
  const { data: categories, isPending, isError } = useCategories(type);
  const remove = useDeleteCategory();

  const handleDelete = (category) => {
    if (confirm(`Delete "${category.name}"?`)) remove.mutate(category.id);
  };

  return (
    <Container>
      <Header>
        <h1>Categories</h1>
        <Primary type="button" onClick={() => setEditing({ type })}>
          <v.agregar aria-hidden="true" />
          New category
        </Primary>
      </Header>

      <Tabs role="group" aria-label="Category type">
        {tabs.map((t) => (
          <button
            key={t.type}
            type="button"
            aria-pressed={type === t.type}
            onClick={() => {
              setType(t.type);
              remove.reset();
            }}
          >
            {t.label}
          </button>
        ))}
      </Tabs>

      {remove.isError && <Alert role="alert">{categoryErrorMessage(remove.error)}</Alert>}

      {isPending ? (
        <Muted>Loading…</Muted>
      ) : isError ? (
        <Alert role="alert">Couldn't load categories.</Alert>
      ) : categories.length === 0 ? (
        <Muted>No {type} categories yet.</Muted>
      ) : (
        <List>
          {categories.map((c) => (
            <li key={c.id}>
              <Swatch $color={c.color} aria-hidden="true">
                {c.icon}
              </Swatch>
              <span className="name">{c.name}</span>
              <IconButton type="button" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                <v.iconeditarTabla aria-hidden="true" />
              </IconButton>
              <IconButton
                type="button"
                className="danger"
                onClick={() => handleDelete(c)}
                disabled={remove.isPending}
                aria-label={`Delete ${c.name}`}
              >
                <v.iconeliminarTabla aria-hidden="true" />
              </IconButton>
            </li>
          ))}
        </List>
      )}

      {editing && <CategoryDialog category={editing} onClose={() => setEditing(null)} />}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 640px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
`;

const Primary = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  width: fit-content;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;

  button {
    height: 32px;
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
      color: ${({ theme }) => theme.text};
    }
    &[aria-pressed="true"] {
      background: ${({ theme }) => theme.accentSoft};
      color: ${({ theme }) => theme.accent};
      font-weight: 600;
    }
  }
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
  }
  li + li {
    border-top: 1px solid ${({ theme }) => theme.border};
  }
  .name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
  }
`;

// Hex color + "26" alpha ≈ 15% tint behind the emoji
const Swatch = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ $color }) => `${$color}26`};
  box-shadow: inset 0 0 0 1px ${({ $color }) => `${$color}66`};
  font-size: 18px;
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 18px;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;

  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
  &.danger:hover {
    color: ${v.colorGastos};
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const Muted = styled.p`
  color: ${({ theme }) => theme.textMuted};
  font-size: 14px;
`;

const Alert = styled.p`
  color: ${v.colorError};
  font-size: 14px;
`;
