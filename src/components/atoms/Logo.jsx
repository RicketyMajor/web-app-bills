import styled from "styled-components";
import { motion } from "motion/react";
import { spring } from "../../styles/motion";

// Monogram "B": stem + two lobes (solid = income, faint = expense). Spec 12.
const parts = [
  { Tag: motion.rect, props: { x: 5, y: 3, width: 4, height: 18, rx: 1.2 }, opacity: 1 },
  { Tag: motion.path, props: { d: "M11 3h3.5a4 4 0 0 1 0 8H11Z" }, opacity: 1 },
  { Tag: motion.path, props: { d: "M11 13h4.5a4 4 0 0 1 0 8H11Z" }, opacity: 0.55 },
];

export function Logo({ size = 28, animated = false, title }) {
  return (
    <Tile $size={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.64)} height={Math.round(size * 0.64)} fill="currentColor">
        {parts.map(({ Tag, props, opacity }, i) => (
          <Tag
            key={i}
            {...props}
            initial={animated ? { opacity: 0, y: -4 } : false}
            animate={{ opacity, y: 0 }}
            transition={{ ...spring, delay: animated ? 0.08 * i : 0 }}
          />
        ))}
      </svg>
    </Tile>
  );
}

const Tile = styled.span`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => Math.round($size * 0.24)}px;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.onAccent};
`;
