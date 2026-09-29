import { useEffect, useState } from "react";
import { isoDate } from "../utils/movements";

// Today's date ("YYYY-MM-DD"), re-read when the tab regains focus so a page left open
// past midnight or month end catches up. Same date → React skips the re-render.
export function useToday() {
  const [today, setToday] = useState(() => isoDate(new Date()));
  useEffect(() => {
    const refresh = () => setToday(isoDate(new Date()));
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return today;
}
