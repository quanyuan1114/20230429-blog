"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "首页", key: "home" },
  { href: "/research", label: "研究规划", key: "research" },
  { href: "/notes", label: "学习笔记", key: "notes" },
  { href: "/reflections", label: "学习心得", key: "reflections" },
  { href: "/reading", label: "文献阅读", key: "reading" },
];

export function SiteHeader({ active }: { active: string }) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("firefly-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("firefly-theme", next);
  }

  return (
    <header className="nav-wrap container">
      <Link className="brand" href="/" aria-label="Firefly 首页">
        <span className="brand-mark" aria-hidden="true"><i /></span>
        <span>FIREFLY</span>
      </Link>
      <nav aria-label="主导航">
        {links.map((link) => (
          <Link
            href={link.href}
            className={active === link.key ? "nav-active" : undefined}
            key={link.key}
          >
            {link.label}
          </Link>
        ))}
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
          title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        >
          <span aria-hidden="true">{theme === "dark" ? "☼" : "◐"}</span>
        </button>
      </nav>
    </header>
  );
}
