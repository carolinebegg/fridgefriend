// frontend/src/utils/recipeTagUtils.ts

// Priority buckets – earlier arrays are considered more important
const MEAL_TYPE_TAGS = [
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Beverage",
  "Smoothie",
  "Cocktail",
];

const DIFFICULTY_SPEED_TAGS = ["Quick", "Easy", "Make-Ahead", "Meal-Prep"];

const DIET_TAGS = [
  "Vegan",
  "Vegetarian",
  "Pescatarian",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Soy-Free",
  "Egg-Free",
  "Kosher",
  "Halal",
  "Paleo",
  "Keto",
  "Low-Carb",
  "Low-Fat",
  "Low-Sodium",
  "Sugar-Free",
  "High-Protein",
  "High-Fiber",
  "Whole30",
  "Mediterranean",
  "Plant-Based",
  "Raw",
  "Macrobiotic",
  "Organic",
];

const METHOD_TAGS = [
  "One-Pot",
  "Sheet-Pan",
  "Slow-Cooker",
  "Instant-Pot",
  "Air-Fryer",
  "No-Cook",
  "Grilling",
  "Baking",
  "Roasting",
  "Stir-Frying",
  "Freezer-Friendly",
  "Leftovers",
];

const OCCASION_TAGS = [
  "Kid-Friendly",
  "Budget-Friendly",
  "Comfort Food",
  "Healthy",
  "Indulgent",
  "Holiday",
  "Party",
  "Appetizer",
  "Side-Dish",
  "Main-Course",
];

const PRIORITY_BUCKETS: string[][] = [
  MEAL_TYPE_TAGS,
  DIFFICULTY_SPEED_TAGS,
  DIET_TAGS,
  METHOD_TAGS,
  OCCASION_TAGS,
];

// Export all tags flattened for use in tag picker UI
export const ALL_RECIPE_TAGS = [
  ...MEAL_TYPE_TAGS,
  ...DIFFICULTY_SPEED_TAGS,
  ...DIET_TAGS,
  ...METHOD_TAGS,
  ...OCCASION_TAGS,
];

function getTagPriority(tag: string): number {
  for (let i = 0; i < PRIORITY_BUCKETS.length; i++) {
    if (PRIORITY_BUCKETS[i].includes(tag)) return i;
  }
  // Anything not explicitly in buckets gets lowest priority
  return PRIORITY_BUCKETS.length;
}

export interface SelectedTags {
  visibleTags: string[];
  remainingCount: number;
}

/**
 * Given all tags on a recipe, choose the most important ones
 * to show on a compact card UI.
 */
export function selectImportantTags(
  allTags: string[] | undefined,
  maxVisible: number = 2
): SelectedTags {
  if (!allTags || allTags.length === 0) {
    return { visibleTags: [], remainingCount: 0 };
  }

  // De-duplicate while preserving original order
  const seen = new Set<string>();
  const uniqueTags: string[] = [];
  for (const t of allTags) {
    if (!t) continue;
    if (!seen.has(t)) {
      seen.add(t);
      uniqueTags.push(t);
    }
  }

  // Stable sort by priority (lower = more important)
  const sorted = [...uniqueTags].sort((a, b) => {
    const pa = getTagPriority(a);
    const pb = getTagPriority(b);
    if (pa !== pb) return pa - pb;
    // Same priority: keep original relative order
    return uniqueTags.indexOf(a) - uniqueTags.indexOf(b);
  });

  const visibleTags = sorted.slice(0, maxVisible);
  const remainingCount = Math.max(sorted.length - visibleTags.length, 0);

  return { visibleTags, remainingCount };
}
