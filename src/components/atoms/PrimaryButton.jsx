import styled from "styled-components";
import { motion } from "motion/react";
import { spring } from "../../styles/motion";

// The one accent-filled action per screen
export const PrimaryButton = styled(motion.button).attrs({ whileTap: { scale: 0.97 }, transition: spring })`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.onAccent};
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
