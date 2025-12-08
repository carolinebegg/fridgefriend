// src/utils/fridgeIcons.tsx
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// If you want slightly stricter typing, you can do:
// type MCIconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
// and then type iconName: MCIconName | string

export function getFridgeIconForItem(
  name: string,
  label?: string | null,
  size: number = 24
) {
  const lowerName = name.toLowerCase();
  const lowerLabel = (label || "").toLowerCase();

  // Relaxed typing here to avoid TS errors on icon names
  let iconName: string = "food";

  if (lowerLabel.includes("dairy") || /milk|cheese|yogurt/.test(lowerName)) {
    iconName = "carton-of-milk";
  } else if (lowerLabel.includes("meat") || /chicken|beef|pork/.test(lowerName)) {
    iconName = "food-drumstick";
  } else if (lowerLabel.includes("grain") || /bread|rice|pasta/.test(lowerName)) {
    iconName = "bread-slice";
  } else if (
    lowerLabel.includes("produce") ||
    /apple|banana|lettuce|carrot/.test(lowerName)
  ) {
    iconName = "fruit-grapes-outline";
  } else if (lowerLabel.includes("snack") || /chips|cracker|snack/.test(lowerName)) {
    iconName = "food-outline";
  } else if (lowerLabel.includes("sweets") || /cake|cookie|chocolate/.test(lowerName)) {
    iconName = "cupcake";
  } else if (
    lowerLabel.includes("beverage") ||
    /juice|soda|water|drink/.test(lowerName)
  ) {
    iconName = "cup-water";
  } else if (lowerLabel.includes("frozen")) {
    iconName = "snowflake";
  } else if (lowerLabel.includes("canned")) {
    iconName = "food-can";
  } else if (lowerLabel.includes("spice") || /salt|pepper|spice/.test(lowerName)) {
    iconName = "shaker-outline";
  }

  return (
    <MaterialCommunityIcons
      // TS is fine because name is just string now
      name={iconName as any}
      size={size}
      color="#3D2F25"
    />
  );
}
