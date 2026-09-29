import { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { CURRENCY_LOCALES } from "../../utils/formatMoney";
import { useDeleteAccount, useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { useThemeStore } from "../../store/themeStore";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { Card } from "../atoms/Card";
import { Skeleton } from "../atoms/Skeleton";
import { Modal, ModalActions } from "../molecules/Modal";
import { PageHeader } from "../molecules/PageHeader";
import { LoadError } from "../molecules/LoadError";
import { SegmentedControl } from "../molecules/SegmentedControl";
import { RecurringList } from "../organisms/RecurringList";
import { Muted } from "../atoms/Muted";
import { Alert } from "../atoms/Alert";

const currencyName = new Intl.DisplayNames("en", { type: "currency" });
const CONFIRM_WORD = "DELETE";

export function SettingsTemplate() {
  const { data: profile, isPending, isError, refetch } = useProfile();
  const update = useUpdateProfile();
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    update.mutate({
      full_name: form.get("full_name").trim() || null,
      currency: form.get("currency"),
      monthly_budget: form.get("monthly_budget") || null,
    });
  };

  return (
    <Container>
      <PageHeader title="Settings" />

      {isPending ? (
        <Section aria-busy="true">
          <Skeleton $h={20} $w="30%" />
          <Skeleton $h={40} />
          <Skeleton $h={40} />
        </Section>
      ) : isError ? (
        <LoadError message="Couldn't load your settings." onRetry={refetch} />
      ) : (
        <Section as="form" onSubmit={handleSubmit} onChange={() => !update.isPending && update.reset()}>
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
          <label>
            <span>Monthly budget</span>
            <input
              name="monthly_budget"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              placeholder="No budget"
              defaultValue={profile.monthly_budget ?? ""}
            />
          </label>
          <div className="actions">
            <PrimaryButton type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </PrimaryButton>
            {update.isSuccess && <Muted role="status">Saved</Muted>}
            {update.isError && <Alert role="alert">Couldn't save. Please try again.</Alert>}
          </div>
        </Section>
      )}

      <RecurringList />

      <Appearance />

      <Section className="danger">
        <h2>Delete account</h2>
        <p>Removes your account, categories and movements for good. This can't be undone.</p>
        <DangerButton type="button" onClick={() => setDeleting(true)}>
          Delete account…
        </DangerButton>
      </Section>

      {deleting && <DeleteAccountDialog onClose={() => setDeleting(false)} />}
    </Container>
  );
}

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

// Applies instantly; the profile keeps light/dark for other devices (null = system)
function Appearance() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const update = useUpdateProfile();

  const handleChange = (next) => {
    setMode(next);
    update.mutate({ theme: next === "system" ? null : next });
  };

  return (
    <Section aria-labelledby="appearance-title">
      <h2 id="appearance-title">Appearance</h2>
      <SegmentedControl value={mode} onChange={handleChange} options={MODES} label="Theme" />
      {update.isError && <Alert role="alert">Couldn't save your theme. It still applies on this device.</Alert>}
    </Section>
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
  gap: 20px;
  max-width: 640px;
`;

const Section = styled(Card)`
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
    height: 36px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.fieldBorder};
    border-radius: 6px;
    /* Fields on a surface card use the canvas so they read as fields */
    background: ${({ theme }) => theme.bgtotal};
    color: inherit;
    font: inherit;
    font-size: 14px;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    font-size: 14px;
  }
  &.danger {
    align-items: flex-start;
  }
`;

// Outlined, not filled: PrimaryButton stays the one accent action on the page.
const DangerButton = styled.button`
  --danger: ${({ theme }) => theme.expenseText};
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--danger);
  border-radius: 6px;
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
