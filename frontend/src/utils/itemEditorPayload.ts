// src/utils/itemEditorPayload.ts
import { ItemEditorValues } from "../components/ItemEditorModal";

export interface ItemEditorPayload {
  name: string;
  quantity: number;
  unit: string;
  label?: string;
  expirationDate?: string;
}

/**
 * Shared mapping from ItemEditorValues -> request payload for API.
 * Used by both Grocery and Fridge screens so behavior stays in sync.
 */
export function editorValuesToPayload(
  values: ItemEditorValues
): ItemEditorPayload {
  const { name, quantity, unit, label, expirationDate } = values;

  return {
    name,
    quantity,
    unit,
    // we send undefined instead of null so backend can omit the field
    label: label ?? undefined,
    expirationDate: expirationDate
      ? expirationDate.toISOString()
      : undefined,
  };
}
