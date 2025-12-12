// src/services/aiRecipeService.ts
import { openai } from "../integrations/openAiClient";
import { IRecipeIngredient } from "../models/Recipe";
import { IFridgeItem } from "../models/FridgeItem";

export type AiRecipeMode = "fridge" | "random" | "prompt";

export interface GenerateAiRecipeOptions {
  mode: AiRecipeMode;
  customPrompt?: string;        // ✅ optional
  fridgeItems?: IFridgeItem[];  // ✅ optional
  sourceUrl?: string;           // ✅ optional
}

/**
 * Shape returned from OpenAI before being attached to user/id/timestamps.
 */
export interface AiRecipeDraft {
  title: string;
  description?: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  ingredients: IRecipeIngredient[]; // fridgeItem/pantryItem/nameKey will be added later if needed
  steps: string[];
  tags: string[];
  sourceUrl?: string;
}

function buildUserInstruction(options: GenerateAiRecipeOptions): string {
  const { mode, customPrompt, fridgeItems, sourceUrl } = options;
  const safeFridgeItems = fridgeItems ?? [];

  if (mode === "fridge") {
    const fridgeSummary = safeFridgeItems
      .map((item) => `${item.name} (${item.quantity} ${item.unit || ""})`)
      .join(", ");

    return `
Create a recipe based primarily on these ingredients from the user's fridge:
${fridgeSummary || "(no items provided, use common pantry items)"}

The recipe should be realistic and something a home cook could make.
If appropriate, add a few helpful tags (like "quick", "vegetarian", "one-pot").
${sourceUrl ? `This recipe is not imported from a URL; set sourceUrl to null.` : ""}
`;
  }

  if (mode === "random") {
    return `
Create a random but appealing recipe.
Choose a cuisine and style, but it must be practical to cook at home.
Include a few descriptive tags (e.g. "comfort food", "spicy", "30-minute").
`;
  }

  // mode === "prompt"
  return `
The user has given you instructions for the kind of recipe they want.
Follow their constraints very closely.

User prompt:
${customPrompt || "(no prompt provided, choose something simple and common)"}

Include a few helpful tags that summarize style, diet, or difficulty.
If there is no external URL, set sourceUrl to null.
`;
}

const SYSTEM_PROMPT = `
You are a recipe generator that outputs STRICT JSON for a mobile app.
Do NOT include markdown, commentary, or any fields not listed below.
Return exactly one JSON object with this shape:

{
  "title": string,
  "description": string | null,
  "photoUrl": string | null,
  "prepTimeMinutes": number | null,
  "cookTimeMinutes": number | null,
  "ingredients": [
    {
      "name": string,
      "quantity": number | null,
      "unit": string | null,
      "label": string | null,
      "note": string | null,
      "brand": string | null
    }
  ],
  "steps": string[],
  "tags": string[],
  "sourceUrl": string | null
}

Guidelines:
- Use realistic quantities and units.
- Use short, clear step instructions.
- "tags": 2–6 short keywords, e.g. ["quick", "vegetarian", "pasta"].
- If you don't know photoUrl or sourceUrl, set them to null.
- If you don't know a field, use null rather than inventing specific brand names, people, or URLs.
`;

// 👇 This is your generateAiRecipe implementation, with only very light typings added
export async function generateAiRecipe(
  options: GenerateAiRecipeOptions
): Promise<AiRecipeDraft> {
  const userInstruction = buildUserInstruction(options);

  // Use Chat Completions API with JSON mode
  const completion: any = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInstruction },
    ],
    response_format: { type: "json_object" }, // ✅ JSON mode here
  });

  const raw = completion.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("AI response did not contain any content");
  }

  // Be a bit defensive in case it ever adds code fences
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const ingredients: IRecipeIngredient[] =
    parsed.ingredients?.map((ing: any) => ({
      name: ing.name,
      quantity: ing.quantity ?? undefined,
      unit: ing.unit ?? undefined, // Unit | string in your model
      label: ing.label ?? undefined,
      note: ing.note ?? undefined,
      brand: ing.brand ?? undefined,
      // fridgeItem, pantryItem, nameKey left undefined for now
    })) ?? [];

  const draft: AiRecipeDraft = {
    title: parsed.title,
    description: parsed.description ?? "",
    photoUrl: parsed.photoUrl ?? "",
    prepTimeMinutes: parsed.prepTimeMinutes ?? undefined,
    cookTimeMinutes: parsed.cookTimeMinutes ?? undefined,
    ingredients,
    steps: parsed.steps ?? [],
    tags: parsed.tags ?? [],
    sourceUrl: parsed.sourceUrl ?? options.sourceUrl ?? undefined,
  };

  return draft;
}