import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  RiHome5Line,
  RiPriceTag3Line,
  RiExchangeDollarLine,
  RiPieChart2Line,
  RiFlag2Line,
  RiSettings3Line,
  RiSunLine,
  RiMoonLine,
  RiLogoutBoxRLine,
  RiSideBarLine,
} from "react-icons/ri";
import { v } from "../../styles/variables";
import { visuallyHidden } from "../../styles/visuallyHidden";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useMonthTotals } from "../../hooks/useMonthTotals";
import { monthName } from "../../utils/movements";
import { useCurrentMonth } from "../../hooks/useToday";
import { useMoney, useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { Logo } from "../atoms/Logo";
import { AnimatedNumber } from "../atoms/AnimatedNumber";
import { motion } from "motion/react";
import { spring } from "../../styles/motion";

const links = [
  { to: "/", label: "Home", icon: RiHome5Line },
  { to: "/categories", label: "Categories", icon: RiPriceTag3Line },
  { to: "/movements", label: "Movements", icon: RiExchangeDollarLine },
  { to: "/reports", label: "Reports", icon: RiPieChart2Line },
  { to: "/goals", label: "Goals", icon: RiFlag2Line },
  { to: "/settings", label: "Settings", icon: RiSettings3Line },
];

export function Sidebar() {
  const currentMonth = useCurrentMonth();
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.session?.user);
  const signOut = useAuthStore((s) => s.signOut);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const totals = useMonthTotals(currentMonth);
  // A new month's label shows "—" until its own balance loads (not last month's figure)
  const balance = totals.isPlaceholderData ? undefined : totals.data?.balance;
  const money = useMoney();
  const profile = useProfile().data;
  const updateProfile = useUpdateProfile();

  // Another device chose light/dark: adopt it. null = system or never chosen, keep the local mode.
  useEffect(() => {
    if (profile?.theme) useThemeStore.getState().setMode(profile.theme);
  }, [profile?.theme]);

  // localStorage flips instantly (no flash); the profile follows in the background
  const handleToggleTheme = () => {
    toggleTheme();
    updateProfile.mutate({ theme: useThemeStore.getState().theme });
  };

  // Name edited in Settings wins; Google metadata is the fallback
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email;
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <Aside $collapsed={collapsed}>
      <Brand>
        <Logo size={28} />
        <span className="label">Bills</span>
      </Brand>

      <Balance $collapsed={collapsed} $sign={Math.sign(balance ?? 0)}>
        <span>{monthName(currentMonth)}</span>
        <strong>{balance === undefined ? "—" : <AnimatedNumber value={balance} format={money} />}</strong>
      </Balance>

      <Nav>
        {links.map(({ to, label, icon: Icon }) => (
          <Item key={to} to={to} end={to === "/"} title={collapsed ? label : undefined}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="nav-pill" className="pill" transition={spring} />}
                <Icon aria-hidden="true" />
                <span className="label">{label}</span>
              </>
            )}
          </Item>
        ))}
      </Nav>

      <Footer>
        <Action type="button" onClick={handleToggleTheme} title="Toggle theme">
          {theme === "light" ? <RiMoonLine aria-hidden="true" /> : <RiSunLine aria-hidden="true" />}
          <span className="label">{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </Action>

        <User>
          {avatar ? (
            <img src={avatar} alt="" referrerPolicy="no-referrer" />
          ) : (
            <Initial aria-hidden="true">{name?.[0]?.toUpperCase()}</Initial>
          )}
          <span className="label">{name}</span>
        </User>

        <Action type="button" onClick={signOut} title="Sign out">
          <RiLogoutBoxRLine aria-hidden="true" />
          <span className="label">Sign out</span>
        </Action>

        <Action
          type="button"
          className="collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <RiSideBarLine aria-hidden="true" />
          <span className="label">Collapse</span>
        </Action>
      </Footer>
    </Aside>
  );
}

const rowStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 36px;
  padding: 0 10px;
  border: none;
  border-radius: 6px;
  background: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;

  svg {
    flex-shrink: 0;
    font-size: 20px;
  }
  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
  &:active {
    transform: scale(0.97);
  }
`;

const Aside = styled.aside`
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: ${({ $collapsed }) => ($collapsed ? "68px" : "232px")};
  height: 100vh;
  padding: 16px 12px;
  border-right: 1px solid ${({ theme }) => theme.border};

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      .label {
        ${visuallyHidden}
      }
    `}

  @media (max-width: ${v.bpbart}) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 64px;
    padding: 8px;
    border-right: none;
    border-top: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.bgtotal};

    .label {
      ${visuallyHidden}
    }
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;

  @media (max-width: ${v.bpbart}) {
    display: none;
  }
`;

const Balance = styled.div`
  display: ${({ $collapsed }) => ($collapsed ? "none" : "flex")};
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 0 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-size: 13px;

  /* Direct child only: AnimatedNumber renders a span inside strong */
  > span {
    color: ${({ theme }) => theme.textMuted};
  }
  strong {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${({ $sign, theme }) =>
      $sign > 0 ? theme.incomeText : $sign < 0 ? theme.expenseText : theme.text};
  }
  @media (max-width: ${v.bpbart}) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: ${v.bpbart}) {
    flex: 1;
    flex-direction: row;
    justify-content: space-around;
    min-width: 0;
  }
`;

const Item = styled(NavLink)`
  ${rowStyles}
  position: relative;
  isolation: isolate;

  /* Active background slides between items (motion layoutId) */
  .pill {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 6px;
    background: ${({ theme }) => theme.accentSoft};
  }
  &.active {
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
  }
  /* Bottom bar: the 6 links share the width, so 8 items fit down to 320px */
  @media (max-width: ${v.bpbart}) {
    flex: 1 1 0;
    min-width: 0;
    justify-content: center;
    padding-inline: 0;
  }
`;

const Action = styled.button`
  ${rowStyles}
  width: 100%;
  font-family: inherit;

  @media (max-width: ${v.bpbart}) {
    width: auto;
    &.collapse {
      display: none;
    }
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;

  @media (max-width: ${v.bpbart}) {
    flex-direction: row;
    margin-top: 0;
  }
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    outline: 1px solid ${({ theme }) => theme.border};
    outline-offset: -1px;
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (max-width: ${v.bpbart}) {
    display: none;
  }
`;

const Initial = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.accent};
  font-weight: 600;
`;
