# Changelog

All notable changes to Bills are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.1] — 2026-09-29

### Fixed
- Dates catch up when you come back to a tab left open overnight or past the end of the month: the sidebar balance, Home, category totals, due labels, goals and the date of a new movement.
- Moving a repeating movement onto a date that already has one from the same repeat now says so, instead of showing a generic error.

### Accessibility
- Form fields are named by their label only; hints are read as descriptions and stay readable.
- The CSV import announces "Reading…" and a short result once per file, instead of on every checkbox.

## [1.0.0] — 2026-09-29

The first complete release of Bills, a personal expense tracker that runs in the browser and installs like an app. Live at https://web-app-bills.vercel.app.

### Added

**Getting started**
- Sign in with Google. Your data is private to your account.
- A sign-in page with a short tour of what the app does.
- Public Privacy Policy and Terms of Service pages.

**Home**
- A monthly balance written as a sentence: what's left from your income, or from your monthly budget if you set one.
- A cumulative spending chart comparing this month with the same days of last month.
- Recent movements, bills still to pay (with "due in 3 days" and "2 days late" labels), your budgets and active savings goals at a glance.
- A friendly welcome the first time you sign in.

**Movements**
- Record income and expenses with a category, date, description and a paid/pending status.
- Switch months with the month selector; income, expenses and net totals update as you go.
- Search and filter across all months by category, status and amount.
- Repeat a movement weekly, monthly or yearly: upcoming ones are created automatically. Pause or edit repeats from Settings.
- Export what you see as a CSV file, and import a CSV export back. The import preview flags duplicates, lets you map unknown categories and lists any rows it can't read.

**Categories**
- Create income and expense categories with an emoji and a color. Names are unique regardless of case.
- A grid of categories showing each one's total for the month and how it compares with the same stretch of last month.

**Budgets**
- Set a monthly budget per expense category and an overall monthly budget.
- A Budgets page to plan each month: change one month without touching the usual amount, and roll over what was left (or overspent) last month.
- Meters that show how much of each budget you've used, and say so clearly when you go over.

**Reports**
- A monthly trend of income and expenses, and a breakdown by category, each with an accessible table view.

**Savings goals**
- Save toward targets with or without a deadline. Log contributions and withdrawals, and see your progress and the monthly pace you need.

**Settings and app**
- Change your display name and currency.
- Light, dark or system appearance, synced across your devices.
- Delete your account and all its data.
- Install Bills on your phone or desktop as an app.

### Accessibility
- Income and expense amounts use colors that stay readable in light and dark mode.
- Every chart has a text description and a table alternative; meters announce the real percentage, even over 100%.
- Closing a dialog returns keyboard focus to where you were.
- Form fields and toolbar controls have clearly visible borders.
- Animations respect the "reduce motion" setting.
