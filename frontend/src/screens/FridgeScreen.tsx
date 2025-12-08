// src/screens/FridgeScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { fridgeApi, FridgeItem } from "../api/fridgeApi";
import ItemEditorModal, {
  ItemEditorValues,
} from "../components/ItemEditorModal";
import { getFridgeIconForItem } from "../utils/fridgeIcons";

const COLORS = {
  background: "#FFFDF7",
  card: "#FFFFFF",
  border: "#E5D9C5",
  text: "#3D2F25",
  muted: "#8A7B6C",
  yellow: "#F6D26B",
  yellowDark: "#D6AE3A",
  pillBg: "#FFF3C7",
  error: "#C84646",
};

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

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fridgeApi.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to load fridge items", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
  React.useCallback(() => {
    load();
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
      // optional: keep "Uncategorized" at the end
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
    // Same mapping style as GroceryScreen
    const { name, quantity, unit, label, expirationDate } = values;

    const payload = {
      name,
      quantity,
      unit,
      label: label ?? undefined,
      // send ISO string or omit field if no expiration
      expirationDate: expirationDate
        ? expirationDate.toISOString()
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
        // prepend, like grocery
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.yellowDark} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {shelves.map((shelf) => (
          <View key={shelf.label} style={styles.shelfContainer}>
            <Text style={styles.shelfTitle}>{shelf.label}</Text>
            <View style={styles.shelfBoard}>
              {shelf.items.map((item) => (
                <FridgeItemRow
                  key={item._id}
                  item={item}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          </View>
        ))}

        {shelves.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your fridge is empty</Text>
            <Text style={styles.emptyText}>
              Check off items on your grocery list to add them here, or add
              items manually.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating add button */}
      <Pressable style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color={COLORS.text} />
      </Pressable>

      {/* Shared Add/Edit modal */}
      <ItemEditorModal
        visible={editorVisible}
        title={editingItem ? "Edit Fridge Item" : "Add Fridge Item"}
        submitting={submitting}
        onClose={handleEditorClose}
        initialValues={{
          name: editingItem?.name ?? "",
          quantity: editingItem ? String(editingItem.quantity) : "1",
          unit: editingItem?.unit ?? "piece",
          label: editingItem?.label ?? null,
          expirationDate: editingItem?.expirationDate
            ? new Date(editingItem.expirationDate)
            : null,
        }}
        onSubmit={handleEditorSubmit}
      />
    </View>
  );
};

export default FridgeScreen;

// ---------- Item row component ----------

interface FridgeItemRowProps {
  item: FridgeItem;
  onEdit: (item: FridgeItem) => void;
  onDelete: (item: FridgeItem) => void;
}

const FridgeItemRow: React.FC<FridgeItemRowProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const expiringSoon = isExpiringSoon(item.expirationDate);

  return (
    <View style={styles.itemRow}>
      <View style={styles.iconContainer}>
        {getFridgeIconForItem(item.name, item.label)}
      </View>

      <View style={styles.itemMain}>
        <Text style={styles.itemName}>{item.name}</Text>

        <View style={styles.itemMetaRow}>
          <Text style={styles.itemMetaText}>
            {item.quantity} {item.unit}
          </Text>

          {item.label && (
            <View style={styles.labelPill}>
              <Text style={styles.labelPillText}>{item.label}</Text>
            </View>
          )}
        </View>

        {item.expirationDate && (
          <Text
            style={[
              styles.expirationText,
              expiringSoon && styles.expirationTextWarning,
            ]}
          >
            Expires {formatDate(item.expirationDate)}
          </Text>
        )}
      </View>

      <View style={styles.itemActions}>
        <Pressable style={styles.iconButton} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={20} color={COLORS.muted} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => onDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </Pressable>
      </View>
    </View>
  );
};

// ---------- Helpers ----------

function formatDate(raw?: string) {
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

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  shelfContainer: {
    marginBottom: 16,
  },
  shelfTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  shelfBoard: {
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconContainer: {
    marginRight: 10,
  },
  itemMain: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  itemMetaText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  expirationText: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.muted,
  },
  expirationTextWarning: {
    color: COLORS.error,
    fontWeight: "500",
  },
  labelPill: {
    backgroundColor: COLORS.pillBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labelPillText: {
    fontSize: 11,
    color: COLORS.text,
  },
  itemActions: {
    flexDirection: "row",
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 24,
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
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
