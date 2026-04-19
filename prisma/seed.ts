import { PrismaClient, Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const DEFAULT_PRICING = {
  id: 1,
  costPerCc: 13,
  smallDesignFlatCost: 40,
  maxInchForMinimum: 5,
  pretreatmentOnePosition: 40,
  pretreatmentMultiPosition: 70,
  whiteGarmentDiscount: 40,
  markup: 0.35,
  minSellingSmall: 100,
  minSellingLarge: 150,
  largeSizeThreshold: 8,
};

const DEFAULT_PAPER_SIZES = [
  { code: "A7", label: 'A7 (3 × 4")', widthInch: 3, heightInch: 4, sortOrder: 1 },
  { code: "A6", label: 'A6 (4 × 6")', widthInch: 4, heightInch: 6, sortOrder: 2 },
  { code: "A5", label: 'A5 (6 × 8")', widthInch: 6, heightInch: 8, sortOrder: 3 },
  { code: "A4", label: 'A4 (8 × 12")', widthInch: 8, heightInch: 12, sortOrder: 4 },
  { code: "A3", label: 'A3 (12 × 16")', widthInch: 12, heightInch: 16, sortOrder: 5 },
  { code: "A2", label: 'A2 (16 × 21")', widthInch: 16, heightInch: 21, sortOrder: 6 },
];

const DEFAULT_TIERS = [
  { minQty: 30, rate: 0.05, label: "30 ตัวขึ้นไป ลด 5%" },
  { minQty: 50, rate: 0.1, label: "50 ตัวขึ้นไป ลด 10%" },
  { minQty: 100, rate: 0.15, label: "100 ตัวขึ้นไป ลด 15%" },
];

const DEFAULT_ADDONS = [
  { code: "collarLogo", label: "โลโก้คอ", cost: 30, enabled: true },
];

async function main() {
  await prisma.pricingConfig.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULT_PRICING,
  });

  for (const size of DEFAULT_PAPER_SIZES) {
    await prisma.paperSize.upsert({
      where: { code: size.code },
      update: size,
      create: size,
    });
  }

  for (const tier of DEFAULT_TIERS) {
    await prisma.volumeTier.upsert({
      where: { minQty: tier.minQty },
      update: tier,
      create: tier,
    });
  }

  for (const addon of DEFAULT_ADDONS) {
    await prisma.addon.upsert({
      where: { code: addon.code },
      update: { label: addon.label, cost: addon.cost },
      create: addon,
    });
  }

  await seedAdminProfiles();

  console.log("Seed completed.");
}

async function seedAdminProfiles() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    console.log("[seed] no ADMIN_EMAILS, skip admin bootstrap");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn(
      "[seed] missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY, skip admin bootstrap"
    );
    return;
  }

  const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const email of adminEmails) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) {
      console.warn("[seed] list users failed:", error.message);
      return;
    }
    const found = data.users.find(
      (u) => u.email?.toLowerCase() === email
    );
    if (!found) {
      console.warn(
        `[seed] admin email ${email} not found in auth.users (invite via /admin/users first)`
      );
      continue;
    }
    await prisma.profile.upsert({
      where: { id: found.id },
      update: { email, role: Role.ADMIN, isActive: true },
      create: {
        id: found.id,
        email,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log(`[seed] admin profile ensured: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
