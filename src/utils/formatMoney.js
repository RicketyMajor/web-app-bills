// Currencies offered in Settings, each formatted the way its country reads it
export const CURRENCY_LOCALES = {
  USD: "en-US",
  EUR: "es-ES",
  CLP: "es-CL",
  MXN: "es-MX",
  ARS: "es-AR",
  COP: "es-CO",
  PEN: "es-PE",
  GBP: "en-GB",
};

// Components use useMoney() (src/hooks/useProfile.js) to get the user's currency
export const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? "en-US", {
    style: "currency",
    currency,
    signDisplay: "exceptZero",
  }).format(amount);
