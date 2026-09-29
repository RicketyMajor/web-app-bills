// Ledger system (spec 12). Every text pair ≥4.5:1, checked with context/sources/contrast-audit.js.
// Never put textMuted on accentSoft in light (4.2:1).
export const Light = {
  bgtotal: "#FAFAF9", // canvas
  surface: "#FFFFFF", // cards, modals, tooltips
  border: "#E7E5E4",
  fieldBorder: "#8A8A93", // inputs and toolbar controls: 3:1+ on surface and canvas (WCAG 1.4.11)
  text: "#18181B",
  textMuted: "#71717A",
  accent: "#5B21B6",
  accentSoft: "rgba(91,33,182,0.08)",
  onAccent: "#FFFFFF",
  incomeText: "#15803D",
  expenseText: "#B42318",
};

export const Dark = {
  bgtotal: "#0C0C0E",
  surface: "#16161A",
  border: "#26262B",
  fieldBorder: "#63636C",
  text: "#F4F4F5",
  textMuted: "#A1A1AA",
  accent: "#A78BFA",
  accentSoft: "rgba(167,139,250,0.14)",
  onAccent: "#0C0C0E",
  incomeText: "#4ADE80",
  expenseText: "#F87171",
};
