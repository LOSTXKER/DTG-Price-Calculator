import { SIDE_KEYS, type SideId } from "@/lib/calculator";
import { type GarmentColor, type SideStates, type SideState } from "@/lib/state";

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  enabledSideIds: SideId[];
}

function isSideSizeOk(side: SideState["input"]): boolean {
  if (side.size === "") return false;
  if (side.size !== "custom") return true;
  return (side.customWidthInch ?? 0) > 0 && (side.customHeightInch ?? 0) > 0;
}

function isSideCcOk(state: SideState): boolean {
  return state.ccColorStr !== "" || state.ccWhiteStr !== "";
}

export function hasUserTouched(
  garmentColor: GarmentColor,
  sideStates: SideStates,
  collarLogo: boolean
): boolean {
  if (garmentColor !== null) return true;
  if (collarLogo) return true;
  for (const { id } of SIDE_KEYS) {
    const s = sideStates[id];
    if (s.input.enabled) return true;
    if (s.ccColorStr !== "") return true;
    if (s.ccWhiteStr !== "") return true;
    if (s.input.size !== "") return true;
  }
  return false;
}

export function validateInputs(
  garmentColor: GarmentColor,
  sideStates: SideStates,
  hasTouched: boolean
): ValidationResult {
  const enabledSideIds = SIDE_KEYS.filter(
    ({ id }) => sideStates[id].input.enabled
  ).map(({ id }) => id);

  const anySideEnabled = enabledSideIds.length > 0;
  const allSidesValid = enabledSideIds.every((id) => {
    const s = sideStates[id];
    return isSideSizeOk(s.input) && isSideCcOk(s);
  });

  const isValid = garmentColor !== null && anySideEnabled && allSidesValid;

  const missingFields: string[] = [];
  if (hasTouched) {
    if (garmentColor === null) missingFields.push("สีเสื้อ");
    if (!anySideEnabled) {
      missingFields.push("เลือกอย่างน้อย 1 ตำแหน่งสกรีน");
    } else {
      for (const meta of SIDE_KEYS) {
        if (!sideStates[meta.id].input.enabled) continue;
        const s = sideStates[meta.id];
        if (!isSideSizeOk(s.input)) {
          missingFields.push(`ขนาดลาย (${meta.label})`);
        }
        if (!isSideCcOk(s)) {
          missingFields.push(`CC หมึก (${meta.label})`);
        }
      }
    }
  }

  return { isValid, missingFields, enabledSideIds };
}
