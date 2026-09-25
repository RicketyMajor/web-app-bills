import { useState } from "react";
import { NavLink } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  RiHome5Line,
  RiPriceTag3Line,
  RiExchangeDollarLine,
  RiPieChart2Line,
  RiSunLine,
  RiMoonLine,
  RiLogoutBoxRLine,
  RiSideBarLine,
} from "react-icons/ri";
import { v } from "../../styles/variables";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useMonthBalance } from "../../hooks/useMonthBalance";
import { formatMoney } from "../../utils/formatMoney";

const links = [
  { to: "/", label: "Home", icon: RiHome5Line },
  { to: "/categories", label: "Categories", icon: RiPriceTag3Line },
  { to: "/movements", label: "Movements", icon: RiExchangeDollarLine },
  { to: "/reports", label: "Reports", icon: RiPieChart2Line },
];

const monthName = new Date().toLocaleDateString("en-US", { month: "long" });

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.session?.user);
  const signOut = useAuthStore((s) => s.signOut);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { data: balance } = useMonthBalance();

  const name = user?.user_metadata?.full_name ?? user?.email;
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <Aside $collapsed={collapsed}>
      <Brand>
        <img src={v.logo} alt="" />
        <span className="label">Bills</span>
      </Brand>

      <Balance $collapsed={collapsed} $sign={Math.sign(balance ?? 0)}>
        <span>{monthName} balance</span>
        <strong>{balance === undefined ? "—" : formatMoney(balance)}</strong>
      </Balance>

      <Nav>
        {links.map(({ to, label, icon: Icon }) => (
          <Item key={to} to={to} end={to === "/"} title={collapsed ? label : undefined}>
            <Icon aria-hidden="true" />
            <span className="label">{label}</span>
          </Item>
        ))}
      </Nav>

      <Footer>
        <Action type="button" onClick={toggleTheme} title="Toggle theme">
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

// Hidden visually but still read by screen readers
const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

const rowStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
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
  gap: 16px;
  width: ${({ $collapsed }) => ($collapsed ? "72px" : "240px")};
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
  gap: 12px;
  padding: 0 8px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;

  img {
    width: 32px;
    height: 32px;
  }
  @media (max-width: ${v.bpbart}) {
    display: none;
  }
`;

const Balance = styled.div`
  display: ${({ $collapsed }) => ($collapsed ? "none" : "flex")};
  flex-direction: column;
  gap: 2px;
  padding: 0 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  strong {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    color: ${({ $sign, theme }) =>
      $sign > 0 ? v.colorIngresos : $sign < 0 ? v.colorGastos : theme.text};
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
  }
`;

const Item = styled(NavLink)`
  ${rowStyles}

  &.active {
    background: ${({ theme }) => theme.accentSoft};
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
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
