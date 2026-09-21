"use client";

import { useState, useEffect } from "react";

/** Local-time greeting — the dashboard is server-rendered (UTC on Vercel),
 *  so the server must never compute time-of-day text (4pm IST = 10:30 UTC,
 *  which wrongly showed "Good morning"). */
export function HeroGreeting({ businessName }: { businessName: string }) {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <h1 className="text-lg font-extrabold leading-tight truncate">
      {greeting}, {businessName}!
    </h1>
  );
}
