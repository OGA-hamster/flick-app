"use client";

import { useEffect, useState } from "react";

const THEMES = [
  {
    name: "iron",
    base: "linear-gradient(135deg, #0a0a0f 0%, #1a0f1f 40%, #2d1b2e 100%)",
    orb1: "rgba(139, 0, 40, 0.35)",
    orb2: "rgba(80, 20, 100, 0.3)",
    orb3: "rgba(20, 10, 30, 0.4)",
  },
  {
    name: "discipline",
    base: "linear-gradient(135deg, #060608 0%, #14101f 45%, #241536 100%)",
    orb1: "rgba(90, 30, 160, 0.3)",
    orb2: "rgba(200, 160, 40, 0.18)",
    orb3: "rgba(10, 10, 20, 0.45)",
  },
  {
    name: "resolve",
    base: "linear-gradient(135deg, #08050a 0%, #200a18 40%, #33101f 100%)",
    orb1: "rgba(180, 20, 60, 0.32)",
    orb2: "rgba(60, 10, 40, 0.35)",
    orb3: "rgba(120, 40, 20, 0.2)",
  },
  {
    name: "focus",
    base: "linear-gradient(135deg, #05070a 0%, #0d1a24 45%, #14232f 100%)",
    orb1: "rgba(20, 90, 130, 0.3)",
    orb2: "rgba(90, 40, 140, 0.25)",
    orb3: "rgba(5, 15, 25, 0.5)",
  },
];

export default function LivelyBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % THEMES.length);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lively-bg-wrapper">
      {THEMES.map((theme, i) => (
        <div
          key={theme.name}
          className="lively-bg-layer"
          style={{
            background: theme.base,
            opacity: i === index ? 1 : 0,
          }}
        >
          <div className="lively-orb lively-orb-1" style={{ background: theme.orb1 }} />
          <div className="lively-orb lively-orb-2" style={{ background: theme.orb2 }} />
          <div className="lively-orb lively-orb-3" style={{ background: theme.orb3 }} />
        </div>
      ))}
    </div>
  );
}