import { motion } from "motion/react";
import { useMonthStore } from "../../store/monthStore";
import { ease } from "../../styles/motion";

// Remounts its content per month and slides it in from the direction of travel
export function MonthSlide({ children, className }) {
  const month = useMonthStore((s) => s.month);
  const dir = useMonthStore((s) => s.dir);
  return (
    <motion.div
      key={month}
      className={className}
      initial={{ opacity: 0, x: dir * 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease }}
    >
      {children}
    </motion.div>
  );
}
