// Shared motion language (spec 12): springs for position, ease-out for opacity/color.
export const ease = [0.16, 1, 0.3, 1];
export const spring = { type: "spring", stiffness: 400, damping: 35 };

// List rows: staggered enter (30 ms per row, capped at 8), collapse on removal.
// Spread on a motion.li inside <AnimatePresence>.
export const rowMotion = (i) => ({
  layout: "position",
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease, delay: Math.min(i, 8) * 0.03 } },
  exit: { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.2, ease } },
});

// Grid tiles: same stagger, but shrink out (collapsing height breaks a grid)
export const tileMotion = (i) => ({
  layout: "position",
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease, delay: Math.min(i, 8) * 0.03 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease } },
});
