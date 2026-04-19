"use client";

import { useState } from "react";

interface CopyButtonProps {
  label: string;
  onClick: () => Promise<void> | void;
  variant?: "primary" | "secondary";
}

export default function CopyButton({
  label,
  onClick,
  variant = "primary",
}: CopyButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      await onClick();
      setFeedback("สำเร็จ!");
      setTimeout(() => setFeedback(null), 1800);
    } catch {
      setFeedback("เกิดข้อผิดพลาด");
      setTimeout(() => setFeedback(null), 1800);
    }
  };

  const base =
    "rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors inline-flex items-center gap-2";
  const variants = {
    primary:
      "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
    secondary:
      "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]",
  };

  return (
    <button onClick={handleClick} className={`${base} ${variants[variant]}`}>
      {feedback ?? label}
    </button>
  );
}
