"use client";

import { useTransition } from "react";
import { setRoleAction } from "@/app/admin/actions/users";

export default function RoleSelect({
  id,
  role,
  disabled,
}: {
  id: string;
  role: "USER" | "ADMIN";
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={disabled || pending}
      onChange={(e) => {
        const next = e.target.value;
        const fd = new FormData();
        fd.set("id", id);
        fd.set("role", next);
        startTransition(async () => {
          await setRoleAction(fd);
        });
      }}
      className="rounded-lg bg-[var(--fill)] px-2 py-1 text-[12px] outline-none disabled:opacity-50"
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
