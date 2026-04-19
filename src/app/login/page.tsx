import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "บัญชีนี้ไม่มีสิทธิ์เข้าหน้านี้",
  disabled: "บัญชีนี้ถูกระงับการใช้งาน ติดต่อผู้ดูแลระบบ",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
            DTG Calculator
          </p>
        </div>

        <LoginForm
          next={next ?? "/"}
          initialError={error ? ERROR_MESSAGES[error] : undefined}
        />
      </div>
    </div>
  );
}
