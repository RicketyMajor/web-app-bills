import styled from "styled-components";

// Hex color + "26" alpha ≈ 15% tint behind the emoji
export const CategorySwatch = styled.span.attrs({ "aria-hidden": true })`
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
