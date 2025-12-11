import { ItemEditorValues } from "../components/ItemEditorModal";

export interface ItemEditorPayload {
  name: string;
  quantity: number;
  unit: string;
  label?: string;
  expirationDate?: string;
  brand?: string;
}

export function editorValuesToPayload(
  values: ItemEditorValues
): ItemEditorPayload {
  const { name, quantity, unit, label, expirationDate, brand } = values;

  return {
    name,
    quantity: quantity ?? 1,
    unit: unit || "piece",
    label: label ?? undefined,
    expirationDate: expirationDate
      ? expirationDate.toISOString()
      : undefined,
    brand: brand || undefined,
  };
}
