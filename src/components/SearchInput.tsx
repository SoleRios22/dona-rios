"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-sm">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nombre o subcategoría..."
        className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm"
      />
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8b9480"
        strokeWidth="1.8"
        className="absolute left-3.5 top-1/2 -translate-y-1/2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    </form>
  );
}
