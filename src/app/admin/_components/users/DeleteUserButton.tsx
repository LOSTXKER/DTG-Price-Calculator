"use client";

import { useTransition } from "react";
import { deleteUserAction } from "@/app/admin/actions/users";

export default function DeleteUserButton({
  id,
  email,
  disabled,
}: {
  id: string;
  email: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`ลบบัญชี ${email}? การลบไม่สามารถกู้คืนได้`)) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteUserAction(fd);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      className="text-[12px] text-[var(--red)] hover:opacity-80 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {pending ? "กำลังลบ…" : "ลบ"}
    </button>
  );
}
