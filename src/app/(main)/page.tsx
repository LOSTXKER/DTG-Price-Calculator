import { loadPricingConfig } from "@/lib/pricing";
import HomeClient from "@/app/_components/HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const config = await loadPricingConfig();
  return <HomeClient config={config} />;
}
