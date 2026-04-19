import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { UserProvider } from "@/app/(main)/_components/UserContext";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await requireUser();
  return (
    <UserProvider
      user={{
        email: session.email,
        isAdmin: session.profile.role === "ADMIN",
      }}
    >
      <div className="min-h-screen">{children}</div>
    </UserProvider>
  );
}
