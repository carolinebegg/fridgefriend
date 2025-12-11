import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { groceryApi, GroceryItem } from "../api/groceryApi";
import ItemEditorModal, {
  ItemEditorValues,
} from "../components/ItemEditorModal";
import { groceryStyles as styles, COLORS } from "../styles/groceryStyles";
import { useFocusEffect } from "@react-navigation/native";

const GroceryScreen: React.FC = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchGroceries = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await groceryApi.getAll();
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load groceries", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroceries();
  }, [fetchGroceries]);

  useFocusEffect(
    useCallback(() => {
      // Silently refetch in background when tab is focused
      fetchGroceries(false);
    }, [fetchGroceries])
  );

  const handleToggle = async (id: string) => {
    try {
      const res = await groceryApi.toggle(id);
      const updated = res.data;
      setItems((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (err) {
      console.error("Failed to toggle grocery item", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await groceryApi.remove(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Failed to delete grocery item", err);
    }
  };

  const handleClearList = async () => {
    if (items.length === 0 || clearing) return;

    try {
      setClearing(true);
      // Simple version: delete each item (can be replaced with a real "clear" endpoint)
      await Promise.all(items.map((item) => groceryApi.remove(item._id)));
      setItems([]);
    } catch (err) {
      console.error("Failed to clear grocery list", err);
    } finally {
      setClearing(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setEditorVisible(true);
  };

  const openEditModal = (item: GroceryItem) => {
    setEditingItem(item);
    setEditorVisible(true);
  };

  const handleEditorClose = () => {
    if (submitting) return;
    setEditorVisible(false);
    setEditingItem(null);
  };

  const handleEditorSubmit = async (values: ItemEditorValues) => {
    const { name, quantity, unit, label, expirationDate } = values;

    try {
      setSubmitting(true);

      if (editingItem) {
        const res = await groceryApi.update(editingItem._id, {
          name,
          quantity,
          unit,
          label: label ?? undefined,
          expirationDate: expirationDate
            ? expirationDate.toISOString()
            : undefined,
        });
        const updated = res.data;
        setItems((prev) =>
          prev.map((it) => (it._id === updated._id ? updated : it))
        );
      } else {
        const res = await groceryApi.create({
          name,
          quantity,
          unit,
          label: label ?? undefined,
          expirationDate: expirationDate
            ? expirationDate.toISOString()
            : undefined,
        });
        setItems((prev) => [res.data, ...prev]);
      }

      setEditorVisible(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save grocery item", err);
    } finally {
      setSubmitting(false);
    }
  };

const renderItem = ({ item }: { item: GroceryItem }) => {
  const expiringSoon = isExpiringSoon(item.expirationDate);

  return (
    <View style={styles.itemRowContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.itemRow,
          pressed && styles.itemRowPressed,
        ]}
        onPress={() => handleToggle(item._id)}
      >
        {/* checkbox */}
        <Pressable
          onPress={() => handleToggle(item._id)}
          style={({ pressed }) => [
            styles.checkbox,
            item.isChecked && styles.checkboxChecked,
            pressed && styles.checkboxPressed,
          ]}
          hitSlop={6}
        >
          {item.isChecked && (
            <Ionicons
              name="checkmark"
              size={16}
              color={COLORS.checkboxCheckmark}
            />
          )}
        </Pressable>

        {/* main text */}
        <View style={styles.itemTextContainer}>
          <Text
            style={[
              styles.itemName,
              item.isChecked && styles.itemNameChecked,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.itemDetail,
              expiringSoon && styles.itemDetailExpiring,
            ]}
            numberOfLines={1}
          >
            {item.quantity} {item.unit}
            {item.expirationDate
              ? `  ·  Expires ${formatDate(item.expirationDate)}`
              : ""}
          </Text>
        </View>

        {/* vertical chip column: label on top, SOON below */}
        <View style={styles.chipColumn}>
          {item.label ? (
            <View style={styles.labelPill}>
              <Text style={styles.labelText}>{item.label}</Text>
            </View>
          ) : null}
          {expiringSoon && (
            <View style={styles.expiringPill}>
              <Text style={styles.expiringPillText}>Soon</Text>
            </View>
          )}
        </View>

        {/* actions */}
        <View style={styles.itemActions}>
          <Pressable
            onPress={() => openEditModal(item)}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            hitSlop={8}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={COLORS.iconMuted}
            />
          </Pressable>
          <Pressable
            onPress={() => handleDelete(item._id)}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.delete} />
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
};

  const remaining = items.filter((i) => !i.isChecked).length;
  const remainingWord = remaining === 1 ? "item" : "items";
  const totalWord = items.length === 1 ? "item" : "items";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Grocery List</Text>
            <Text style={styles.pageSubtitle}>
              {remaining} {remainingWord} left · {items.length}{" "}
              {totalWord}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                (clearing || items.length === 0) && styles.clearButtonDisabled,
                pressed && !clearing && items.length !== 0
                  ? styles.clearButtonPressed
                  : null,
              ]}
              onPress={handleClearList}
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

        {/* List card */}
        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.yellowDark} />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={[
                styles.listContent,
                items.length === 0 && styles.emptyContainer,
              ]}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Your grocery list is empty!. Add more items with the{" "}
                  <Text style={styles.emptyTextAccent}>plus</Text> button.
                </Text>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>

      {/* Floating add button, like Fridge */}
      <Pressable style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color={COLORS.text} />
      </Pressable>

      {/* Shared Add/Edit modal */}
      <ItemEditorModal
        visible={editorVisible}
        title={editingItem ? "Edit Grocery Item" : "Add Grocery Item"}
        submitting={submitting}
        onClose={handleEditorClose}
        initialValues={{
          name: editingItem?.name ?? "",
          quantity: editingItem ? String(editingItem.quantity) : "1",
          unit: editingItem?.unit ?? "loaf",
          label: editingItem?.label ?? null,
          expirationDate: editingItem?.expirationDate
            ? new Date(editingItem.expirationDate)
            : null,
        }}
        onSubmit={handleEditorSubmit}
      />
    </SafeAreaView>
  );
};

function formatDate(raw: string | undefined) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// within 3 days (including today), future only
function isExpiringSoon(raw?: string) {
  if (!raw) return false;
  const now = new Date();
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return false;
  const diffMs = d.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
}

export default GroceryScreen;
