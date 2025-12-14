// src/components/RecipeCard.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Recipe, RecipeIngredient } from "../api/recipeApi";
import { COLORS } from "../styles/groceryStyles";
import { selectImportantTags } from "../utils/recipeTagUtils";
import TagChipsCompact from "./TagChipsCompact";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onAddToGrocery: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onEdit,
  onDelete,
  onAddToGrocery,
}) => {
  const { prepTimeMinutes, cookTimeMinutes } = recipe;
  const totalTimeMinutes = (prepTimeMinutes || 0) + (cookTimeMinutes || 0);
  const [ingredientsExpanded, setIngredientsExpanded] = React.useState(false);
  const [instructionsExpanded, setInstructionsExpanded] = React.useState(false);

  // 🔹 Pick at most 3 important tags for the card
  const { visibleTags, remainingCount } = selectImportantTags(
    recipe.tags || [],
    3
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.description ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {recipe.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => onEdit(recipe)}
            hitSlop={8}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.iconMuted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => onDelete(recipe)}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.delete} />
          </Pressable>
        </View>
      </View>

      {/* Time chips - all in one row */}
      {(prepTimeMinutes || cookTimeMinutes) && (
        <View style={styles.timeRow}>
          {prepTimeMinutes ? (
            <View style={styles.timePill}>
              <Ionicons name="timer-outline" size={14} color={COLORS.text} />
              <Text style={styles.timePillText}>Prep {prepTimeMinutes}m</Text>
            </View>
          ) : null}
          {cookTimeMinutes ? (
            <View style={styles.timePill}>
              <Ionicons name="flame-outline" size={14} color={COLORS.text} />
              <Text style={styles.timePillText}>Cook {cookTimeMinutes}m</Text>
            </View>
          ) : null}
          {totalTimeMinutes > 0 ? (
            <View style={[styles.timePill, styles.totalTimePill]}>
              <Ionicons name="time-outline" size={14} color={COLORS.text} />
              <Text style={styles.timePillText}>Total {totalTimeMinutes}m</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Tags row - smaller chips, up to 3 visible */}
      {(visibleTags.length > 0 || remainingCount > 0) && (
        <TagChipsCompact
          tags={visibleTags}
          remainingCount={remainingCount}
          style={styles.tagsRow}
          onPressTag={() => onEdit(recipe)}
          onPressMore={() => onEdit(recipe)}
        />
      )}

      <Pressable
        style={styles.sectionHeader}
        onPress={() => setIngredientsExpanded(!ingredientsExpanded)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientHeaderRow}>
            <Text style={styles.ingredientCountText}>
              <Text style={{ fontWeight: "700" }}>
                {countAvailableIngredients(recipe.ingredients).fridge}/{recipe.ingredients.length}
              </Text>
              {" "}ingredients
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.addToGroceryButton,
                pressed && styles.addToGroceryPressed,
              ]}
              onPress={() => onAddToGrocery(recipe)}
            >
              <Ionicons name="cart" size={12} color={COLORS.text} />
              <Text style={styles.addToGroceryText}>Add to grocery list</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.expandButton,
            pressed && styles.expandButtonPressed,
          ]}
          onPress={() => setIngredientsExpanded(!ingredientsExpanded)}
        >
          <Ionicons
            name={ingredientsExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.text}
          />
        </Pressable>
      </Pressable>

      {ingredientsExpanded && (
        <>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.length === 0 ? (
              <Text style={styles.emptyText}>No ingredients yet.</Text>
            ) : (
              recipe.ingredients.map((ing, idx) => (
                <View key={`${ing.name}-${idx}`} style={styles.ingredientRow}>
                  <View style={styles.statusIcon}>{renderStatusIcon(ing)}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ingredientName} numberOfLines={1}>
                      {ing.name}
                    </Text>
                    <Text style={styles.ingredientMeta} numberOfLines={1}>
                      {formatIngredientMeta(ing)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}

      {recipe.steps && recipe.steps.length > 0 ? (
        <>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setInstructionsExpanded(!instructionsExpanded)}
          >
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.headerActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.expandButton,
                  pressed && styles.expandButtonPressed,
                ]}
                onPress={() => setInstructionsExpanded(!instructionsExpanded)}
              >
                <Ionicons
                  name={instructionsExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.text}
                />
              </Pressable>
            </View>
          </Pressable>

          {instructionsExpanded && (
            <View style={styles.section}>
              {recipe.steps.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <Text style={styles.stepBullet}>{idx + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}
    </View>
  );
};

export default RecipeCard;

// ---------- helpers ----------

function countAvailableIngredients(ingredients: RecipeIngredient[]): { fridge: number; grocery: number } {
  const fridge = ingredients.filter((ing) => {
    const status = ing.availability?.status;
    return status === "fridge" || status === "fridge-and-grocery";
  }).length;
  const grocery = ingredients.filter((ing) => {
    const status = ing.availability?.status;
    return status === "grocery" || status === "fridge-and-grocery";
  }).length;
  return { fridge, grocery };
}

function renderStatusIcon(ingredient: RecipeIngredient) {
  const status = ingredient.availability?.status;

  if (status === "fridge" || status === "fridge-and-grocery") {
    return <Ionicons name="checkmark-circle" size={20} color="#34C759" />;
  }
  if (status === "grocery") {
    return (
      <Ionicons name="cart-outline" size={20} color={COLORS.yellowDark} />
    );
  }
  return <Ionicons name="close-circle" size={20} color={COLORS.delete} />;
}

function formatIngredientMeta(ing: RecipeIngredient) {
  const parts: string[] = [];
  if (ing.quantity !== undefined) parts.push(String(ing.quantity));
  if (ing.unit) parts.push(ing.unit);
  if (ing.note) parts.push(`· ${ing.note}`);
  return parts.length ? parts.join(" ") : "Optional";
}

// ---------- styles ----------

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    backgroundColor: COLORS.card,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  headerActions: {
    flexDirection: "row",
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 10,
  },
  iconButtonPressed: {
    backgroundColor: "#F7F0E3",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.muted,
  },

  // Time chips row
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 6,
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.pillBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalTimePill: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellowDark,
  },
  timePillText: {
    marginLeft: 3,
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 12,
  },
  // Tags row - smaller styling
  tagsRow: {
    marginBottom: 6,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  ingredientHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
    marginTop: 4,
    gap: 10,
  },
  ingredientCountText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  expandButton: {
    padding: 6,
    borderRadius: 8,
  },
  expandButtonPressed: {
    backgroundColor: "#F7F0E3",
  },
  ingredientsList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: "#FFFDF8",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusIcon: {
    width: 28,
    alignItems: "center",
    marginRight: 8,
  },
  ingredientName: {
    fontWeight: "600",
    color: COLORS.text,
  },
  ingredientMeta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    padding: 12,
    color: COLORS.muted,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  stepBullet: {
    width: 18,
    color: COLORS.muted,
  },
  stepText: {
    flex: 1,
    color: COLORS.text,
  },
  moreText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
  },
  addToGroceryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.pillBg,
  },
  addToGroceryPressed: {
    opacity: 0.7,
  },
  addToGroceryText: {
    marginLeft: 4,
    fontWeight: "600",
    color: COLORS.text,
    fontSize: 12,
  },
});
