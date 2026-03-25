"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark"); // Default to dark for SSR

  useEffect(() => {
    const saved = localStorage.getItem("bingo-theme");
    if (saved) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("bingo-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button 
      onClick={toggle}
      className="btn-cyber fixed-toggle"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        padding: '10px 20px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        fontWeight: 'bold',
        background: 'var(--surface-opaque)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        width: '45px',
        height: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0'
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
