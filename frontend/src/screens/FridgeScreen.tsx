// src/screens/FridgeScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { fridgeApi, FridgeItem } from "../api/fridgeApi";
import ItemEditorModal, {
  ItemEditorValues,
} from "../components/ItemEditorModal";
import FridgeShelf from "../components/FridgeShelf";
import { FRIDGE_COLORS } from "../styles/fridgeTheme";

const COLORS = FRIDGE_COLORS;

type ShelfKey = string;

interface Shelf {
  label: ShelfKey;
  items: FridgeItem[];
}

const FALLBACK_LABEL = "Uncategorized";

const FridgeScreen: React.FC = () => {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await fridgeApi.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to load fridge items", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Silently refetch in background when tab is focused
      load(false);
    }, [load])
  );

  // Group into shelves; items without label go to "Uncategorized"
  const shelves: Shelf[] = useMemo(() => {
    const groups: Record<ShelfKey, FridgeItem[]> = {};

    for (const item of items) {
      const key =
        item.label && item.label.trim().length > 0
          ? item.label
          : FALLBACK_LABEL;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }

    const labels = Object.keys(groups).sort((a, b) => {
      if (a === FALLBACK_LABEL) return 1;
      if (b === FALLBACK_LABEL) return -1;
      return a.localeCompare(b);
    });

    return labels.map((label) => ({
      label,
      items: groups[label],
    }));
  }, [items]);

  const openAddModal = () => {
    setEditingItem(null);
    setEditorVisible(true);
  };

  const openEditModal = (item: FridgeItem) => {
    setEditingItem(item);
    setEditorVisible(true);
  };

  const handleEditorClose = () => {
    if (submitting) return;
    setEditorVisible(false);
    setEditingItem(null);
  };

  const handleEditorSubmit = async (values: ItemEditorValues) => {
    const quantity = values.quantity ?? 1;
    const unit = values.unit?.trim() || "loaf";

    const payload = {
      name: values.name.trim(),
      quantity,
      unit,
      brand: values.brand?.trim() || undefined,
      label: values.label ?? undefined,
      expirationDate: values.expirationDate
        ? values.expirationDate.toISOString()
        : undefined,
    };

    try {
      setSubmitting(true);

      if (editingItem) {
        const updated = await fridgeApi.update(editingItem._id, payload);
        setItems((prev) =>
          prev.map((it) => (it._id === updated._id ? updated : it))
        );
      } else {
        const created = await fridgeApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }

      setEditorVisible(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save fridge item", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: FridgeItem) => {
    try {
      await fridgeApi.remove(item._id);
      setItems((prev) => prev.filter((it) => it._id !== item._id));
    } catch (err) {
      console.error("Failed to delete fridge item", err);
    }
  };

  const handleClearFridge = async () => {
    if (items.length === 0 || clearing) return;

    try {
      setClearing(true);
      await Promise.all(items.map((item) => fridgeApi.remove(item._id)));
      setItems([]);
    } catch (err) {
      console.error("Failed to clear fridge", err);
    } finally {
      setClearing(false);
    }
  };

  const totalWord = items.length === 1 ? "item" : "items";

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.yellowDark} />
        </View>
      </SafeAreaView>
    );
  }

  const hasShelves = shelves.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header (mirrors Grocery style) */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>My Fridge</Text>
            <Text style={styles.pageSubtitle}>
              {items.length} {totalWord} in your fridge
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                (clearing || items.length === 0) && styles.clearButtonDisabled,
                pressed &&
                  !clearing &&
                  items.length !== 0 &&
                  styles.clearButtonPressed,
              ]}
              onPress={handleClearFridge}
              disabled={clearing || items.length === 0}
            >
              {clearing ? (
                <ActivityIndicator size="small" color={COLORS.muted} />
              ) : (
                <Text style={styles.clearButtonText}>Clear</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Card container (matches Grocery) */}
        <View style={styles.card}>
          {hasShelves ? (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {shelves.map((shelf) => (
                <FridgeShelf
                  key={shelf.label}
                  label={shelf.label}
                  items={shelf.items}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Your fridge is empty!</Text>
              <Text style={styles.emptyText}>
                Check off items on your grocery list to add them here, or add
                items manually.
              </Text>
            </View>
          )}
        </View>

        {/* Floating add button (same as Grocery FAB) */}
        <Pressable style={styles.fab} onPress={openAddModal}>
          <Ionicons name="add" size={30} color={COLORS.text} />
        </Pressable>

        {/* Shared Add/Edit modal */}
        <ItemEditorModal
          context="fridge"
          visible={editorVisible}
          title={editingItem ? "Edit Fridge Item" : "Add Fridge Item"}
          submitting={submitting}
          onClose={handleEditorClose}
          initialValues={{
            name: editingItem?.name ?? "",
            quantity: editingItem ? String(editingItem.quantity) : "1",
            unit: editingItem?.unit ?? "loaf",
            brand: editingItem?.brand ?? "",
            label: editingItem?.label ?? null,
            expirationDate: editingItem?.expirationDate
              ? new Date(editingItem.expirationDate)
              : null,
            note: "", // fridge doesn't use notes
          }}
          onSubmit={handleEditorSubmit}
          showCategory={true}
          showExpiration={true}
          showNote={false}
          requireQuantity={true}
          labelOptions={[
            "Dairy",
            "Grain",
            "Meat",
            "Produce",
            "Snacks",
            "Sweets",
            "Beverages",
            "Condiments",
            "Spices",
            "Canned",
            "Frozen",
            "Other",
            "Takeout", // fridge-only
          ]}
        />
      </View>
    </SafeAreaView>
  );
};

export default FridgeScreen;

// ---------- Styles ----------

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

  // Header (mirrors Grocery)
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFF8E8",
  },
  clearButtonDisabled: {
    opacity: 0.4,
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
  clearButtonText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  // Card container
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  // Scroll content (matches Grocery listContent)
  listContent: {
    paddingVertical: 6,
    paddingBottom: 80,
  },

  // Empty state inside card
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24, // same as Grocery
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
