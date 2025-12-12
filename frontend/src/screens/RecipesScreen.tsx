// src/screens/RecipesScreen.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { recipeApi, Recipe } from "../api/recipeApi";
import { COLORS } from "../styles/groceryStyles";
import RecipeCard from "../components/RecipeCard";
import RecipeEditorModal, {
  RecipeEditorValues,
} from "../components/RecipeEditorModal";

// NEW: AI imports
import AIRecipeActionSheet, {
  AiRecipeMode,
} from "../components/AIRecipeActionSheet";
import {
  generateAiRecipe,
  AiRecipePreview,
} from "../api/aiRecipeApi";

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // NEW: AI state
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await recipeApi.list(true);
      setRecipes(data);
    } catch (err) {
      console.error("Failed to load recipes", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Silently refetch in background when tab is focused
      load(false);
    }, [load])
  );

  const openAddModal = () => {
    setEditingRecipe(null);
    setEditorVisible(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setEditorVisible(true);
  };

  const handleCloseEditor = () => {
    if (submitting) return;
    setEditorVisible(false);
    setEditingRecipe(null);
  };

  const handleSubmitRecipe = async (values: RecipeEditorValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      photoUrl: values.photoUrl,
      prepTimeMinutes: values.prepTimeMinutes,
      cookTimeMinutes: values.cookTimeMinutes,
      ingredients: values.ingredients,
      steps: values.steps,
    };

    try {
      setSubmitting(true);

      if (editingRecipe) {
        const updated = await recipeApi.update(editingRecipe._id, payload);
        setRecipes((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
      } else {
        const created = await recipeApi.create(payload as any);
        setRecipes((prev) => [created, ...prev]);
      }

      setEditorVisible(false);
      setEditingRecipe(null);
    } catch (err) {
      console.error("Failed to save recipe", err);
      Alert.alert("Oops", "Couldn't save that recipe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    Alert.alert(
      "Delete recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await recipeApi.remove(recipe._id);
              setRecipes((prev) => prev.filter((r) => r._id !== recipe._id));
            } catch (err) {
              console.error("Failed to delete recipe", err);
              Alert.alert("Oops", "Couldn't delete that recipe.");
            }
          },
        },
      ]
    );
  };

  const handleAddToGrocery = async (recipe: Recipe) => {
    try {
      const res = await recipeApi.addIngredientsToGrocery(recipe._id);
      Alert.alert(
        "Added to grocery",
        res.addedCount
          ? `${res.addedCount} item${
              res.addedCount === 1 ? "" : "s"
            } added or updated.`
          : "No ingredients to add."
      );
      // Silently refetch recipes to update availability icons
      await load(false);
    } catch (err) {
      console.error("Failed to add ingredients to grocery", err);
      Alert.alert("Oops", "Couldn't add ingredients right now.");
    }
  };

  // --- AI integration helpers ---

  const mapAiPreviewToCreatePayload = (preview: AiRecipePreview) => {
    return {
      title: preview.title,
      description: preview.description,
      photoUrl: preview.photoUrl,
      prepTimeMinutes: preview.prepTimeMinutes,
      cookTimeMinutes: preview.cookTimeMinutes,
      ingredients: preview.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        label: ing.label,
        note: ing.note,
        brand: ing.brand,
        // nameKey will be computed on the backend if needed
      })),
      steps: preview.steps,
      // If your backend create route accepts these, they’ll be used;
      // otherwise they’ll just be ignored.
      // tags: preview.tags,
      // sourceUrl: preview.sourceUrl,
    };
  };

  const handleGenerateAiRecipe = async (
    mode: AiRecipeMode,
    prompt?: string
  ) => {
    try {
      setAiLoading(true);

      const preview = await generateAiRecipe({ mode, prompt });
      const payload = mapAiPreviewToCreatePayload(preview);

      // Create the recipe immediately, then open it in edit mode
      const created = await recipeApi.create(payload as any);
      setRecipes((prev) => [created, ...prev]);

      setEditingRecipe(created);
      setEditorVisible(true);
      setAiSheetVisible(false);
    } catch (err) {
      console.error("AI recipe generation failed", err);
      Alert.alert(
        "AI recipe failed",
        "Sorry, we couldn't generate a recipe right now. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.yellowDark} />
        </View>
      );
    }

    if (recipes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="book-outline"
            size={48}
            color={COLORS.muted}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyTitle}>No recipes yet</Text>
          <Text style={styles.emptyText}>
            Add your first recipe with the{" "}
            <Text style={styles.emptyTextAccent}>plus</Text> button, or use{" "}
            <Text style={styles.emptyTextAccent}>AI ✨</Text> to generate one.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            onEdit={openEditModal}
            onDelete={handleDeleteRecipe}
            onAddToGrocery={handleAddToGrocery}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Recipes</Text>
            <Text style={styles.pageSubtitle}>Your personal recipe book</Text>
          </View>
        </View>

        <View style={styles.card}>{renderBody()}</View>

        {/* Manual add FAB */}
        <Pressable style={styles.fab} onPress={openAddModal}>
          <Ionicons name="add" size={30} color={COLORS.text} />
        </Pressable>

        {/* AI ✨ FAB */}
        <Pressable
          style={styles.aiFab}
          onPress={() => setAiSheetVisible(true)}
        >
          {aiLoading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Ionicons name="sparkles-outline" size={24} color={COLORS.text} />
          )}
        </Pressable>

        {/* AI action sheet */}
        <AIRecipeActionSheet
          visible={aiSheetVisible}
          onClose={() => {
            if (!aiLoading) setAiSheetVisible(false);
          }}
          onGenerate={handleGenerateAiRecipe}
          loading={aiLoading}
        />

        <RecipeEditorModal
          visible={editorVisible}
          submitting={submitting}
          initialRecipe={editingRecipe}
          onClose={handleCloseEditor}
          onSubmit={handleSubmitRecipe}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 0,
  },
  listContent: {
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 90,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },
  emptyTextAccent: {
    color: COLORS.text,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.yellow,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  aiFab: {
    position: "absolute",
    right: 20,
    bottom: 92, // stacked above the plus FAB
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
