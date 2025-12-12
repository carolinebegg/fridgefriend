import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Recipe, RecipeIngredient } from "../api/recipeApi";
import { COLORS } from "../styles/groceryStyles";

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
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => onEdit(recipe)}
            hitSlop={8}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.iconMuted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => onDelete(recipe)}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.delete} />
          </Pressable>
        </View>
      </View>

      {(prepTimeMinutes || cookTimeMinutes) && (
        <>
          <View style={styles.metaRow}>
            {prepTimeMinutes ? (
              <View style={styles.pill}>
                <Ionicons name="timer-outline" size={14} color={COLORS.text} />
                <Text style={styles.pillText}>Prep {prepTimeMinutes}m</Text>
              </View>
            ) : null}
            {cookTimeMinutes ? (
              <View style={styles.pill}>
                <Ionicons name="flame-outline" size={14} color={COLORS.text} />
                <Text style={styles.pillText}>Cook {cookTimeMinutes}m</Text>
              </View>
            ) : null}
          </View>
          {totalTimeMinutes > 0 ? (
            <View style={styles.totalTimeRow}>
              <View style={[styles.pill, styles.totalTimePill]}>
                <Ionicons name="time-outline" size={14} color={COLORS.text} />
                <Text style={styles.pillText}>Total {totalTimeMinutes}m</Text>
              </View>
            </View>
          ) : null}
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <Pressable
          style={({ pressed }) => [styles.addToGroceryButton, pressed && styles.addToGroceryPressed]}
          onPress={() => onAddToGrocery(recipe)}
        >
          <Ionicons name="cart" size={14} color={COLORS.text} />
          <Text style={styles.addToGroceryText}>Add to grocery</Text>
        </Pressable>
      </View>

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

      {recipe.steps && recipe.steps.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.steps.slice(0, 4).map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <Text style={styles.stepBullet}>{idx + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
          {recipe.steps.length > 4 ? (
            <Text style={styles.moreText}>
              +{recipe.steps.length - 4} more step{recipe.steps.length - 4 === 1 ? "" : "s"}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default RecipeCard;

function renderStatusIcon(ingredient: RecipeIngredient) {
  const status = ingredient.availability?.status;

  if (status === "fridge" || status === "fridge-and-grocery") {
    return <Ionicons name="checkmark-circle" size={20} color="#34C759" />;
  }
  if (status === "grocery") {
    return <Ionicons name="cart-outline" size={20} color={COLORS.yellowDark} />;
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
  metaRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 4,
  },
  totalTimeRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.pillBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalTimePill: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellowDark,
  },
  pillText: {
    marginLeft: 4,
    color: COLORS.text,
    fontWeight: "600",
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.pillBg,
  },
  addToGroceryPressed: {
    opacity: 0.7,
  },
  addToGroceryText: {
    marginLeft: 6,
    fontWeight: "700",
    color: COLORS.text,
  },
});
