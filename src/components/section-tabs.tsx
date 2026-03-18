"use client";

import { useEffect, useState, useRef } from "react";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "reviews", label: "Reviews" },
  { id: "location", label: "Location" },
  { id: "rules", label: "Rules" },
];

export function SectionTabs() {
  const [active, setActive] = useState("overview");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <div className="sticky top-[64px] z-30 -mx-6 border-b bg-background/95 px-6 backdrop-blur-sm">
      <nav className="flex gap-6 overflow-x-auto">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors ${
              active === id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
