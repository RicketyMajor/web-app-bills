import { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { CURRENCY_LOCALES } from "../../utils/formatMoney";
import { useDeleteAccount, useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { Modal, ModalActions } from "../molecules/Modal";

const currencyName = new Intl.DisplayNames("en", { type: "currency" });
const CONFIRM_WORD = "DELETE";

export function SettingsTemplate() {
  const { data: profile, isPending, isError } = useProfile();
  const update = useUpdateProfile();
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    update.mutate({
      full_name: form.get("full_name").trim() || null,
      currency: form.get("currency"),
    });
  };

  return (
    <Container>
      <h1>Settings</h1>

      {isPending ? (
        <Muted>Loading…</Muted>
      ) : isError ? (
        <Alert role="alert">Couldn't load your settings.</Alert>
      ) : (
        <Card as="form" onSubmit={handleSubmit} onChange={() => !update.isPending && update.reset()}>
          <h2>Profile</h2>
          <label>
            <span>Name</span>
            <input name="full_name" defaultValue={profile.full_name ?? ""} maxLength={80} autoComplete="name" />
          </label>
          <label>
            <span>Currency</span>
            <select name="currency" defaultValue={profile.currency}>
              {Object.keys(CURRENCY_LOCALES).map((c) => (
                <option key={c} value={c}>
                  {c} — {currencyName.of(c)}
                </option>
              ))}
            </select>
          </label>
          <div className="actions">
            <PrimaryButton type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </PrimaryButton>
            {update.isSuccess && <Muted role="status">Saved</Muted>}
            {update.isError && <Alert role="alert">Couldn't save. Please try again.</Alert>}
          </div>
        </Card>
      )}

      <Card className="danger">
        <h2>Delete account</h2>
        <p>Removes your account, categories and movements for good. This can't be undone.</p>
        <DangerButton type="button" onClick={() => setDeleting(true)}>
          Delete account…
        </DangerButton>
      </Card>

      {deleting && <DeleteAccountDialog onClose={() => setDeleting(false)} />}
    </Container>
  );
}

// Typed confirmation instead of confirm(): deliberate, and doesn't block automation
function DeleteAccountDialog({ onClose }) {
  const remove = useDeleteAccount();
  const [typed, setTyped] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    remove.mutate(); // on success the auth listener signs out -> /login
  };

  return (
    <Modal title="Delete your account?" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <p>All your categories and movements will be deleted. This can't be undone.</p>
        <label>
          <span>Type {CONFIRM_WORD} to confirm</span>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoFocus />
        </label>
        {remove.isError && <p role="alert">Couldn't delete your account. Please try again.</p>}
        <ModalActions>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="danger" disabled={typed !== CONFIRM_WORD || remove.isPending}>
            {remove.isPending ? "Deleting…" : "Delete account"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 640px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
`;

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  label > span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  input,
  select {
    height: 40px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 8px;
    /* Page surface, not the canvas: fields must read as fields on a borders-only card */
    background: ${({ theme }) => theme.bg};
    color: inherit;
    font: inherit;
    font-size: 14px;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  h2 {
    font-size: 16px;
    font-weight: 600;
  }
  p {
    font-size: 14px;
  }
  &.danger {
    align-items: flex-start;
  }
`;

// Outlined, not filled: PrimaryButton stays the one accent action on the page.
// Red mixed toward the text color: plain #FE6156 on the light canvas is ~2.7:1.
const DangerButton = styled.button`
  --danger: color-mix(in srgb, ${v.colorGastos} 60%, ${({ theme }) => theme.text});
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--danger);
  border-radius: 8px;
  background: none;
  color: var(--danger);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms;

  &:hover {
    background: color-mix(in srgb, ${v.colorGastos} 10%, transparent);
  }
  &:active {
    transform: scale(0.97);
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
