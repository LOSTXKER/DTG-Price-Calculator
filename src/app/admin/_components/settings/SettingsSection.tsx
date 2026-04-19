import { loadPricingConfig } from "@/lib/pricing";
import PricingForm from "./PricingForm";
import PaperSizesTable from "./PaperSizesTable";
import VolumeTiersTable from "./VolumeTiersTable";
import AddonsTable from "./AddonsTable";

export default async function SettingsSection() {
  const config = await loadPricingConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          ตั้งค่าระบบคำนวณราคา
        </h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
          แก้ค่าต่างๆ ที่ใช้คำนวณราคาเสื้อพิมพ์ DTG · เมื่อบันทึก หน้าผู้ใช้จะใช้ค่าใหม่ทันที
        </p>
      </div>

      <PricingForm config={config} />
      <PaperSizesTable items={config.paperSizes} />
      <VolumeTiersTable items={config.volumeTiers} />
      <AddonsTable items={config.addons} />
    </div>
  );
}
