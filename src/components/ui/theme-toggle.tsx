"use client";

import { useEffect } from "react";

// Dark mode removed — BIZORA is light red/white only.
export function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("bizora-theme");
    } catch {}
  }, []);
  return null;
}
