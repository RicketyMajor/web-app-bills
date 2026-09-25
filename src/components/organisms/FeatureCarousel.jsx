import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { RiPauseLine, RiPlayLine } from "react-icons/ri";
import { v } from "../../styles/variables";
import { formatMoney } from "../../utils/formatMoney";
import { CategorySwatch } from "../atoms/CategorySwatch";
import { CategoryBreakdown } from "./CategoryBreakdown";

const AUTOPLAY_MS = 5000;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sample data for the previews (decorative, hidden from screen readers).
// Visuals are functions: the styled components they use are declared below.
const sampleMovements = [
  { icon: "🍔", color: "#FE6156", title: "Lunch with Ana", meta: "Food · Sep 24", amount: -18.5 },
  { icon: "🚌", color: "#F9743B", title: "Monthly pass", meta: "Transport · Sep 10", amount: -72.5 },
  { icon: "💼", color: "#53B257", title: "Salary", meta: "Salary · Sep 1", amount: 1200 },
];
const sampleBreakdown = [
  { id: 1, name: "Housing", icon: "🏠", color: "#3483EB", total: 450 },
  { id: 2, name: "Food", icon: "🍔", color: "#FE6156", total: 198.25 },
  { id: 3, name: "Transport", icon: "🚌", color: "#F9743B", total: 72.5 },
];

const slides = [
  {
    title: "Log it in seconds",
    text: "Record income and expenses with a category, a date and a note.",
    visual: () => (
      <Rows>
        {sampleMovements.map((m) => (
          <li key={m.title}>
            <CategorySwatch $color={m.color}>{m.icon}</CategorySwatch>
            <div>
              <strong>{m.title}</strong>
              <span>{m.meta}</span>
            </div>
            <b style={{ color: m.amount > 0 ? v.colorIngresos : v.colorGastos }}>
              {formatMoney(m.amount)}
            </b>
          </li>
        ))}
      </Rows>
    ),
  },
  {
    title: "See where it goes",
    text: "Monthly reports rank your categories so the big ones stand out.",
    visual: () => <CategoryBreakdown rows={sampleBreakdown} />,
  },
  {
    title: "Know your balance",
    text: "Your month at a glance. Your data is private to your account.",
    visual: () => (
      <Balance>
        <span>{new Date().toLocaleDateString("en-US", { month: "long" })} balance</span>
        <strong>{formatMoney(434.25)}</strong>
      </Balance>
    ),
  },
];

const scrollToSlide = (track, i) =>
  track.scrollTo({ left: i * track.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });

// CSS scroll-snap carousel; autoplay pauses on hover/focus, on demand, and under reduced motion.
export function FeatureCarousel() {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(reducedMotion);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (paused || held) return;
    const id = setTimeout(
      () => scrollToSlide(trackRef.current, (index + 1) % slides.length),
      AUTOPLAY_MS
    );
    return () => clearTimeout(id);
  }, [index, paused, held]);

  const handleScroll = (e) => {
    const t = e.currentTarget;
    setIndex(Math.round(t.scrollLeft / t.clientWidth));
  };

  return (
    <Region
      aria-roledescription="carousel"
      aria-label="Features"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
    >
      <Track ref={trackRef} onScroll={handleScroll}>
        {slides.map((s, i) => (
          <Slide
            key={s.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            inert={i !== index}
          >
            <div className="visual" aria-hidden="true">
              {s.visual()}
            </div>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </Slide>
        ))}
      </Track>

      <Controls>
        {slides.map((s, i) => (
          <Dot
            key={s.title}
            type="button"
            aria-label={`Show slide ${i + 1}: ${s.title}`}
            aria-current={i === index}
            onClick={() => scrollToSlide(trackRef.current, i)}
          />
        ))}
        <PlayPause
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play slides" : "Pause slides"}
        >
          {paused ? <RiPlayLine aria-hidden="true" /> : <RiPauseLine aria-hidden="true" />}
        </PlayPause>
      </Controls>
    </Region>
  );
}

const Region = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 440px;
`;

const Track = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Slide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-snap-align: start;

  .visual {
    margin-bottom: 24px;
    padding: 20px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 12px;
    background: ${({ theme }) => theme.bgtotal};
  }
  h2 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  p {
    color: ${({ theme }) => theme.textMuted};
    font-size: 14px;
    line-height: 1.5;
  }
`;

const Rows = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  div {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }
  strong {
    font-size: 14px;
    font-weight: 500;
  }
  span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 12px;
  }
  b {
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;

const Balance = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 0;

  span {
    color: ${({ theme }) => theme.textMuted};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  strong {
    color: ${v.colorIngresos};
    font-size: 40px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// 24px hit area around an 8px dot
const Dot = styled.button`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: ${({ theme }) => theme.textMuted};
    opacity: 0.4;
    transition: width 150ms, opacity 150ms;
  }
  &[aria-current="true"]::after {
    width: 20px;
    background: ${({ theme }) => theme.accent};
    opacity: 1;
  }
`;

const PlayPause = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  border: none;
  border-radius: 8px;
  background: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
`;
