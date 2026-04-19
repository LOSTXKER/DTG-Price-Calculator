import PortalNav, { type AdminTab } from "./_components/PortalNav";
import OverviewSection from "./_components/OverviewSection";
import UsersSection from "./_components/users/UsersSection";
import SettingsSection from "./_components/settings/SettingsSection";

export const dynamic = "force-dynamic";

const ALLOWED_TABS: AdminTab[] = ["overview", "users", "settings"];

function parseTab(raw: string | undefined): AdminTab {
  if (raw && (ALLOWED_TABS as string[]).includes(raw)) return raw as AdminTab;
  return "overview";
}

export default async function AdminPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = parseTab(sp.tab);

  return (
    <>
      <PortalNav active={tab} />
      {tab === "overview" && <OverviewSection />}
      {tab === "users" && <UsersSection />}
      {tab === "settings" && <SettingsSection />}
    </>
  );
}
