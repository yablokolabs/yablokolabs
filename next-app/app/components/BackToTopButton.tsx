"use client";
import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`back-to-top${visible ? " show" : ""}`}
      onClick={handleClick}
      aria-label="Back to top"
      style={{ position: "fixed", right: "2rem", bottom: "2.5rem", zIndex: 1000, display: visible ? "block" : "none" }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ display: "block", margin: "2px auto 0 auto" }}
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 15 12 9 18 15" />
      </svg>
    </button>
  );
}
