import {
  type CalculatorInput,
  type PrintSideInput,
  type SideId,
  SIDE_KEYS,
} from "@/lib/calculator";

export type GarmentColor = "white" | "dark" | null;

export interface SideState {
  input: PrintSideInput;
  ccColorStr: string;
  ccWhiteStr: string;
}

export type SideStates = Record<SideId, SideState>;

export const SLEEVE_DEFAULT_SIZE = "A7" as const;

const defaultSideInput: PrintSideInput = {
  enabled: false,
  colorCC: 0,
  whiteCC: 0,
  size: "",
  customWidthInch: 0,
  customHeightInch: 0,
};

const defaultSideState: SideState = {
  input: { ...defaultSideInput },
  ccColorStr: "",
  ccWhiteStr: "",
};

export const initialSideStates: SideStates = {
  front: { ...defaultSideState, input: { ...defaultSideInput, enabled: true } },
  back: { ...defaultSideState, input: { ...defaultSideInput } },
  sleeveLeft: { ...defaultSideState, input: { ...defaultSideInput } },
  sleeveRight: { ...defaultSideState, input: { ...defaultSideInput } },
};

export function toCalculatorSides(
  sideStates: SideStates
): Record<SideId, PrintSideInput> {
  return Object.fromEntries(
    SIDE_KEYS.map(({ id }) => [id, sideStates[id].input])
  ) as Record<SideId, PrintSideInput>;
}

export function toCalculatorInput(
  garmentColor: GarmentColor,
  sideStates: SideStates,
  addons: CalculatorInput["addons"],
  quantity: number
): CalculatorInput {
  return {
    isWhiteGarment: garmentColor === "white",
    sides: toCalculatorSides(sideStates),
    addons,
    quantity,
  };
}
