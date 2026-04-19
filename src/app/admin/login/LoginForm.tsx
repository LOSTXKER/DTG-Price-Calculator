"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function LoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    { error: initialError }
  );

  return (
    <form
      action={formAction}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-3"
    >
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">
          อีเมล
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-xl bg-[var(--fill)] px-3 py-2.5 text-[14px] outline-none focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
        />
      </label>

      <label className="block">
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">
          รหัสผ่าน
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-xl bg-[var(--fill)] px-3 py-2.5 text-[14px] outline-none focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
        />
      </label>

      {state?.error && (
        <p className="text-[13px] text-[var(--orange)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--accent)] text-white font-medium py-2.5 text-[14px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
      >
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
