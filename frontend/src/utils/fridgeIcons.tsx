// src/utils/fridgeIcons.tsx
import React from "react";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";

export function getFridgeIconForItem(
  name: string,
  label?: string | null,
  size: number = 26,
  color: string = "#3D2F25"
) {
  const n = name.toLowerCase();
  const l = (label || "").toLowerCase();

  let IconComponent: any = MaterialCommunityIcons;
  let iconName: string = "food-outline";

  // ---------- DAIRY ----------
  if (/(milk|cheese|cream|yogurt|butter)/.test(n) || l.includes("dairy")) {
    IconComponent = MaterialCommunityIcons;
    iconName = "cheese";
  }

  // ---------- CHICKEN / POULTRY ----------
  else if (/(chicken|drumstick|wing|nugget|tenders)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "food-drumstick";
  }

  // ---------- RED MEAT / GENERAL MEAT ----------
  else if (
    /(steak|beef|pork|ham|bacon|lamb|turkey|sausage)/.test(n) ||
    l.includes("meat")
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "food-steak";
  }

  // ---------- FISH / SEAFOOD ----------
  else if (
    /(salmon|fish|tuna|shrimp|cod|tilapia|sardine|trout)/.test(n) ||
    l.includes("seafood") ||
    l.includes("fish")
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "fish";
  }

  // ---------- SWEETS & DESSERTS ----------
  else if (/(birthday cake|cheesecake|cake)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "cake";
  } else if (/(cupcake|muffin)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "cupcake";
  } else if (/(cookie|brownie|donut|doughnut|pastry|tart)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "cupcake";
  } else if (/(candy|chocolate|sweet|taffy|gum)/.test(n) || l.includes("sweets")) {
    IconComponent = MaterialCommunityIcons;
    iconName = "candy";
  }

  // ---------- ICE CREAM / FROZEN DESSERTS ----------
  else if (
    /(ice cream|gelato|sundae|frozen yogurt)/.test(n) ||
    (l.includes("frozen") && /(dessert|ice cream)/.test(n))
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "ice-cream";
  } else if (/(popsicle|ice pop|fudgsicle)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "ice-pop";
  }

  // ---------- SNACKS ----------
  else if (/(pretzel)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "pretzel";
  } else if (/(popcorn)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "popcorn";
  } else if (
    /(chips|cracker|snack|cheezit|goldfish|trail mix|granola bar)/.test(n) ||
    l.includes("snack")
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "pretzel";
  }

  // ---------- FRUITS ----------
  else if (/(apple)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "food-apple";
  } else if (/(pear)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "fruit-pear";
  } else if (
    /(banana|orange|citrus|grape|berry|melon|watermelon|pineapple|mango|peach|plum|apricot)/.test(
      n
    )
  ) {
    IconComponent = MaterialCommunityIcons;
    // use both to get more variety
    if (/(grape|berry|cherry)/.test(n)) iconName = "fruit-pear";
    else iconName = "food-apple";
  }

  // ---------- VEGETABLES ----------
  else if (/(carrot)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "carrot";
  } else if (
    /(lettuce|kale|spinach|greens|cabbage|broccoli|celery|zucchini|cucumber|pepper)/.test(
      n
    ) ||
    l.includes("produce")
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "carrot";
  }

  // ---------- GRAINS / BREAD / RICE / PASTA ----------
  else if (/(rice)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "rice";
  } else if (/(pasta|spaghetti|noodle|mac and cheese)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "bread-slice"; // closest staple carb icon
  } else if (
    /(bread|loaf|bun|bagel|tortilla|pita|roll)/.test(n) ||
    l.includes("grain")
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "bread-slice";
  }

  // ---------- BEVERAGES ----------
  else if (
    l.includes("beverage") ||
    /(juice|soda|water|drink|sparkling)/.test(n)
  ) {
    IconComponent = FontAwesome6;
    iconName = "glass-water";
  }

  // ---------- ALCOHOL ----------
  else if (/(wine|beer|vodka|whiskey|liquor|gin|rum)/.test(n)) {
    IconComponent = FontAwesome6;
    iconName = "wine-bottle";
  }

  // ---------- CONDIMENTS ----------
  else if (
    l.includes("condiment") ||
    /(ketchup|mustard|mayo|mayonnaise|sauce|dressing|hot sauce)/.test(n)
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "bottle-tonic-outline";
  }

  // ---------- SPICES ----------
  else if (
    l.includes("spice") ||
    /(salt|pepper|seasoning|herb|spice)/.test(n)
  ) {
    IconComponent = MaterialCommunityIcons;
    iconName = "shaker-outline";
  }

  // ---------- CANNED ----------
  else if (l.includes("canned") || /(canned|can|soup)/.test(n)) {
    IconComponent = MaterialCommunityIcons;
    iconName = "food-can";
  }

  // ---------- FROZEN (generic) ----------
  else if (l.includes("frozen")) {
    IconComponent = MaterialCommunityIcons;
    iconName = "snowflake";
  }

  // ---------- FALLBACKS BY LABEL ----------
  else if (l.includes("produce")) {
    IconComponent = MaterialCommunityIcons;
    iconName = "food-apple";
  } else if (l.includes("sweets")) {
    IconComponent = MaterialCommunityIcons;
    iconName = "cupcake";
  } else if (l.includes("snack")) {
    IconComponent = MaterialCommunityIcons;
    iconName = "pretzel";
  }

  // Default already set to MaterialCommunityIcons + food-outline
  return <IconComponent name={iconName as any} size={size} color={color} />;
}
