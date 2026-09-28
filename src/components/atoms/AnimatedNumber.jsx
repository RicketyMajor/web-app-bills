import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { ease } from "../../styles/motion";

// Counts from the last shown value to `value` (0 on first mount).
// The span's text is owned here, not by React: written per frame, no re-renders.
export function AnimatedNumber({ value, format }) {
  const ref = useRef(null);
  const shown = useRef(0);
  const formatRef = useRef(format);
  const reduce = useReducedMotion();

  // Before paint: keep the latest formatter (currency can change) and draw the current figure
  useLayoutEffect(() => {
    formatRef.current = format;
    ref.current.textContent = format(shown.current);
  });

  useEffect(() => {
    const controls = animate(shown.current, value, {
      duration: reduce ? 0 : 0.6,
      ease,
      onUpdate: (n) => {
        shown.current = n;
        if (ref.current) ref.current.textContent = formatRef.current(n);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <span ref={ref} />;
}
