// src/components/RecipeEditorModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../styles/groceryStyles";
import { Recipe, RecipeIngredient } from "../api/recipeApi";
import ItemEditorModal, {
  ItemEditorValues,
} from "../components/ItemEditorModal";
import { ALL_RECIPE_TAGS } from "../utils/recipeTagUtils";

export interface RecipeEditorValues {
  title: string;
  description: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
}

export interface IngredientRow {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  label?: string | null;
  note?: string;
  brand?: string;
}

interface RecipeEditorModalProps {
  visible: boolean;
  submitting?: boolean;
  initialRecipe: Recipe | null;
  onClose: () => void;
  onSubmit: (values: RecipeEditorValues) => void;
}

const EMPTY_ROWS: IngredientRow[] = [];

const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  visible,
  submitting = false,
  initialRecipe,
  onClose,
  onSubmit,
}) => {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [ingredientRows, setIngredientRows] =
    useState<IngredientRow[]>(EMPTY_ROWS);

  const [ingredientEditorVisible, setIngredientEditorVisible] =
    useState(false);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(
    null
  );

  // Populate state when opened / recipe changes
  useEffect(() => {
    if (!visible) return;

    setTitle(initialRecipe?.title ?? "");
    setDescription(initialRecipe?.description ?? "");
    setPhotoUrl(initialRecipe?.photoUrl ?? "");
    setPrepTime(initialRecipe?.prepTimeMinutes?.toString() ?? "");
    setCookTime(initialRecipe?.cookTimeMinutes?.toString() ?? "");
    setStepsText((initialRecipe?.steps || []).join("\n"));
    setTags(initialRecipe?.tags || []);
    setTagInput("");

    const rows: IngredientRow[] = (initialRecipe?.ingredients || []).map(
      (ing, idx) => ({
        id: `${idx}-${ing.name ?? idx}`,
        name: ing.name ?? "",
        quantity: ing.quantity,
        unit: ing.unit ?? "",
        label: ing.label ?? null,
        note: ing.note ?? "",
        // Brand isn't on RecipeIngredient yet; start blank.
        brand: "",
      })
    );
    setIngredientRows(rows);

    setIngredientEditorVisible(false);
    setEditingIngredientId(null);
  }, [visible, initialRecipe]);

  // Map UI rows -> RecipeIngredient[] for API payload
  const parsedIngredients: RecipeIngredient[] = useMemo(() => {
    return ingredientRows
      .map((row) => {
        const name = (row.name ?? "").trim();
        const quantity =
          row.quantity !== undefined && row.quantity !== null
            ? Number(row.quantity)
            : undefined;

        return {
          name,
          quantity,
          unit: row.unit?.trim() || undefined,
          label: row.label ?? undefined,
          note: row.note?.trim() || undefined,
          // If/when you add `brand` to RecipeIngredient in recipeApi.ts,
          // you can include: brand: row.brand?.trim() || undefined,
        } as RecipeIngredient;
      })
      .filter(
        (row) =>
          row.name.length > 0 &&
          (row.quantity === undefined || !Number.isNaN(row.quantity))
      );
  }, [ingredientRows]);

  const canSubmit = title.trim().length > 0 && !submitting;

  const openIngredientEditor = (id?: string) => {
    setEditingIngredientId(id ?? null);
    setIngredientEditorVisible(true);
  };

  const handleIngredientSubmit = (values: ItemEditorValues) => {
    const { name, quantity, unit, note, brand, label } = values;

    if (editingIngredientId) {
      setIngredientRows((prev) =>
        prev.map((row) =>
          row.id === editingIngredientId
            ? {
                ...row,
                name,
                quantity,
                unit,
                note,
                brand,
                label: label ?? row.label,
              }
            : row
        )
      );
    } else {
      setIngredientRows((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          name,
          quantity,
          unit,
          note,
          brand,
          label: label ?? null,
        },
      ]);
    }
    setIngredientEditorVisible(false);
    setEditingIngredientId(null);
  };

  const removeRow = (id: string) => {
    setIngredientRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const prep = prepTime.trim() ? Number(prepTime) : undefined;
    const cook = cookTime.trim() ? Number(cookTime) : undefined;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      photoUrl: photoUrl.trim() || undefined,
      prepTimeMinutes: Number.isNaN(prep) ? undefined : prep,
      cookTimeMinutes: Number.isNaN(cook) ? undefined : cook,
      ingredients: parsedIngredients,
      steps: stepsText
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean),
      tags: tags,
    });
  };

  const editingIngredient = editingIngredientId
    ? ingredientRows.find((row) => row.id === editingIngredientId)
    : null;

  const ingredientInitialValues = editingIngredient
    ? {
        name: editingIngredient.name ?? "",
        quantity: editingIngredient.quantity
          ? String(editingIngredient.quantity)
          : "",
        unit: editingIngredient.unit ?? "piece",
        brand: editingIngredient.brand ?? "",
        label: editingIngredient.label ?? null,
        expirationDate: null, // recipes don't use expiration
        note: editingIngredient.note ?? "",
      }
    : {
        name: "",
        quantity: "",
        unit: "piece",
        brand: "",
        label: null,
        expirationDate: null,
        note: "",
      };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Root view padded by real safe-area insets */}
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.screen}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable hitSlop={12} onPress={onClose} disabled={submitting}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
            <Text style={styles.title}>
              {initialRecipe ? "Edit recipe" : "New recipe"}
            </Text>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
            >
              <Text style={styles.saveButtonText}>
                {initialRecipe ? "Save" : "Add"}
              </Text>
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Grandma's lasagna"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="A short description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsSection}>
              <View style={styles.tagsInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={() => {
                    const trimmed = tagInput.trim();
                    if (trimmed && !tags.includes(trimmed)) {
                      setTags([...tags, trimmed]);
                      setTagInput("");
                    }
                  }}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.addTagButton,
                    pressed && styles.addTagButtonPressed,
                  ]}
                  onPress={() => {
                    const trimmed = tagInput.trim();
                    if (trimmed && !tags.includes(trimmed)) {
                      setTags([...tags, trimmed]);
                      setTagInput("");
                    }
                  }}
                >
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </Pressable>
              </View>
              
              {tags.length > 0 && (
                <View style={styles.currentTags}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                      <Pressable
                        onPress={() => setTags(tags.filter((t) => t !== tag))}
                        hitSlop={8}
                      >
                        <Ionicons name="close-circle" size={16} color={COLORS.muted} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={styles.suggestedLabel}>Suggested:</Text>
              <View style={styles.suggestedTags}>
                {ALL_RECIPE_TAGS.filter((t) => !tags.includes(t)).slice(0, 12).map((tag) => (
                  <Pressable
                    key={tag}
                    style={({ pressed }) => [
                      styles.suggestedTagChip,
                      pressed && styles.suggestedTagChipPressed,
                    ]}
                    onPress={() => setTags([...tags, tag])}
                  >
                    <Text style={styles.suggestedTagText}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={styles.label}>Photo URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Prep time (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15"
                  keyboardType="numeric"
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>
              <View style={styles.spacer} />
              <View style={styles.half}>
                <Text style={styles.label}>Cook time (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  keyboardType="numeric"
                  value={cookTime}
                  onChangeText={setCookTime}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addIngButton,
                  pressed && styles.addIngButtonPressed,
                ]}
                onPress={() => openIngredientEditor()}
              >
                <Ionicons name="add" size={18} color={COLORS.text} />
                <Text style={styles.addIngButtonText}>Add</Text>
              </Pressable>
            </View>

            <View style={styles.ingredientsList}>
              {ingredientRows.length === 0 ? (
                <Text style={styles.emptyText}>No ingredients yet.</Text>
              ) : (
                ingredientRows.map((row) => (
                  <View key={row.id} style={styles.ingredientItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ingredientName}>{row.name}</Text>
                      <Text style={styles.ingredientMeta}>
                        {row.quantity && row.unit
                          ? `${row.quantity} ${row.unit}`
                          : row.quantity
                          ? `${row.quantity}`
                          : row.unit
                          ? row.unit
                          : "No quantity"}
                        {row.note ? ` · ${row.note}` : ""}
                      </Text>
                    </View>
                    <View style={styles.ingredientActions}>
                      <Pressable
                        onPress={() => openIngredientEditor(row.id)}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color={COLORS.muted}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => removeRow(row.id)}
                        hitSlop={8}
                        style={{ marginLeft: 8 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={COLORS.delete}
                        />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea, { minHeight: 140 }]}
              placeholder="Write each step on a new line"
              value={stepsText}
              onChangeText={setStepsText}
              multiline
            />
          </ScrollView>
        </View>

        {/* Nested ingredient editor modal (using unified ItemEditorModal) */}
        <ItemEditorModal
          context="recipe"
          visible={ingredientEditorVisible}
          title={editingIngredient ? "Edit Ingredient" : "Add Ingredient"}
          submitting={false}
          onClose={() => {
            setIngredientEditorVisible(false);
            setEditingIngredientId(null);
          }}
          initialValues={ingredientInitialValues}
          onSubmit={handleIngredientSubmit}
          showCategory={true}    // stored for auto-populating grocery later
          showExpiration={false} // recipes don't use expiration
          showNote={true}
          requireQuantity={false}
        />
      </View>
    </Modal>
  );
};

export default RecipeEditorModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.yellow,
    borderRadius: 999,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontWeight: "700",
    color: COLORS.text,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 120,
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  half: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 10,
  },
  addIngButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.yellow,
    borderRadius: 999,
  },
  addIngButtonPressed: {
    opacity: 0.7,
  },
  addIngButtonText: {
    marginLeft: 4,
    fontWeight: "700",
    color: COLORS.text,
    fontSize: 13,
  },
  ingredientsList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: "#FFFDF8",
    overflow: "hidden",
    marginBottom: 14,
  },
  emptyText: {
    padding: 12,
    color: COLORS.muted,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  ingredientActions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  tagsSection: {
    marginBottom: 8,
  },
  tagsInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  addTagButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 999,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.yellowDark,
  },
  addTagButtonPressed: {
    opacity: 0.7,
  },
  currentTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderWidth: 1,
    borderColor: COLORS.yellowDark,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    gap: 6,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  suggestedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: 12,
    marginBottom: 6,
  },
  suggestedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestedTagChip: {
    backgroundColor: COLORS.pillBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  suggestedTagChipPressed: {
    backgroundColor: COLORS.yellow,
  },
  suggestedTagText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
  },
});
