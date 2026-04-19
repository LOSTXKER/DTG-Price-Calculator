"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/app/admin/actions/users";

function genPassword(len = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

export default function CreateUserForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [copyOk, setCopyOk] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => emailRef.current?.focus(), 60);
  }, [open]);

  const reset = () => {
    setEmail("");
    setName("");
    setPassword("");
    setShowPwd(false);
    setRole("USER");
    setError(null);
    setCreated(null);
    setCopyOk(false);
  };

  const close = () => {
    if (pending) return;
    setOpen(false);
    setTimeout(reset, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("name", name);
    fd.set("password", password);
    fd.set("role", role);
    startTransition(async () => {
      const res = await createUserAction(fd);
      if (!res.ok) {
        setError(res.error ?? "สร้างไม่สำเร็จ");
        return;
      }
      setCreated({ email, password });
      router.refresh();
    });
  };

  const useGenerated = () => {
    setPassword(genPassword(12));
    setShowPwd(true);
  };

  const copyCredentials = async () => {
    if (!created) return;
    const text = `อีเมล: ${created.email}\nรหัสผ่าน: ${created.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] text-white text-[13px] font-semibold px-3.5 h-9 hover:bg-[var(--accent-hover)] transition-colors shadow-[0_1px_3px_rgba(0,113,227,0.3)]"
      >
        <PlusIcon />
        เพิ่มผู้ใช้ใหม่
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-5"
          onClick={close}
        >
          <div
            className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold tracking-tight">
                  เพิ่มผู้ใช้ใหม่
                </h2>
                <p className="text-[12.5px] text-[var(--text-tertiary)] mt-1 leading-relaxed">
                  ตั้งอีเมลและรหัสผ่านให้ผู้ใช้โดยตรง · ส่งให้เขาเอง
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-2 py-1 disabled:opacity-40"
              >
                ปิด
              </button>
            </header>

            {created ? (
              <div className="px-5 pb-5 space-y-3">
                <div className="rounded-xl bg-[var(--green-bg)] border border-[var(--green)]/30 p-3 space-y-2">
                  <p className="text-[13px] font-semibold text-[var(--green)]">
                    ✓ สร้างผู้ใช้เรียบร้อย
                  </p>
                  <p className="text-[11.5px] text-[var(--text-tertiary)] leading-relaxed">
                    คัดลอกข้อมูลด้านล่างส่งให้ผู้ใช้ทันที — รหัสผ่านนี้จะไม่แสดงอีก
                  </p>
                  <div className="font-mono text-[12.5px] bg-[var(--card)] rounded-lg px-3 py-2 space-y-0.5">
                    <div>
                      <span className="text-[var(--text-tertiary)]">
                        อีเมล:
                      </span>{" "}
                      <span className="font-semibold tabular-nums">
                        {created.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)]">
                        รหัสผ่าน:
                      </span>{" "}
                      <span className="font-semibold tabular-nums">
                        {created.password}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyCredentials}
                    className="flex-1 rounded-xl bg-[var(--fill)] text-[var(--text-primary)] font-medium py-2.5 text-[13px] hover:opacity-80 transition-opacity"
                  >
                    {copyOk ? "✓ คัดลอกแล้ว" : "คัดลอกอีเมล + รหัสผ่าน"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setTimeout(() => emailRef.current?.focus(), 50);
                    }}
                    className="flex-1 rounded-xl bg-[var(--accent)] text-white font-semibold py-2.5 text-[13px] hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    เพิ่มอีกคน
                  </button>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="w-full text-[12.5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] py-1"
                >
                  เสร็จสิ้น
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
                <Field label="อีเมล" required>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="ชื่อ (ไม่บังคับ)">
                  <input
                    type="text"
                    placeholder="ชื่อแสดงในระบบ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="รหัสผ่าน" required hint="อย่างน้อย 8 ตัวอักษร">
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputCls} pr-24 tabular-nums`}
                    />
                    <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={useGenerated}
                        className="text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] px-2 py-1 rounded-md transition-colors"
                        title="สุ่มรหัสผ่าน 12 ตัว"
                      >
                        สุ่ม
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-1.5 py-1 rounded-md transition-colors"
                      >
                        {showPwd ? "ซ่อน" : "แสดง"}
                      </button>
                    </div>
                  </div>
                </Field>

                <Field label="Role">
                  <div className="grid grid-cols-2 gap-2">
                    <RolePill
                      active={role === "USER"}
                      onClick={() => setRole("USER")}
                      label="USER"
                      desc="ใช้งานคำนวณ ดูประวัติ"
                    />
                    <RolePill
                      active={role === "ADMIN"}
                      onClick={() => setRole("ADMIN")}
                      label="ADMIN"
                      desc="เข้าถึง Admin Portal"
                    />
                  </div>
                </Field>

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--orange)]/10">
                    <span className="text-[var(--orange)] text-[13px]">⚠</span>
                    <p className="text-[12.5px] text-[var(--orange)] font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    disabled={pending}
                    className="flex-1 rounded-xl bg-[var(--fill)] text-[var(--text-primary)] font-medium py-2.5 text-[13px] hover:opacity-80 transition-opacity disabled:opacity-60"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-[1.4] rounded-xl bg-[var(--accent)] text-white font-semibold py-2.5 text-[13px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
                  >
                    {pending ? "กำลังสร้าง…" : "สร้างผู้ใช้"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const inputCls =
  "w-full rounded-xl bg-[var(--fill)] px-3.5 py-2.5 text-[14px] outline-none focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)] placeholder:text-[var(--text-tertiary)]";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-semibold text-[var(--text-primary)] flex items-center gap-1">
        {label}
        {required && <span className="text-[var(--orange)]">*</span>}
        {hint && (
          <span className="ml-auto text-[11px] font-normal text-[var(--text-tertiary)]">
            {hint}
          </span>
        )}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function RolePill({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start text-left px-3 py-2 rounded-xl transition-all ${
        active
          ? "bg-[var(--seg-active)] shadow-[0_0_0_1.5px_var(--accent),0_1px_3px_var(--seg-active-shadow)]"
          : "bg-[var(--fill)] hover:bg-[var(--card-hover)]"
      }`}
    >
      <span className="text-[13px] font-semibold leading-tight">{label}</span>
      <span className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">
        {desc}
      </span>
    </button>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
