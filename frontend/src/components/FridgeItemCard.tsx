// src/components/FridgeItemCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { FridgeItem } from "../api/fridgeApi";
import { getFridgeIconForItem } from "../utils/fridgeIcons";
import { FRIDGE_COLORS } from "../styles/fridgeTheme";

const COLORS = FRIDGE_COLORS;

interface FridgeItemCardProps {
  item: FridgeItem;
  onEdit: (item: FridgeItem) => void;
  onDelete: (item: FridgeItem) => void;
}

const FridgeItemCard: React.FC<FridgeItemCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const expiringSoon = isExpiringSoon(item.expirationDate);

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.iconContainer}>
          {getFridgeIconForItem(item.name, item.label)}
        </View>
        {item.label && (
          <View style={styles.labelPill}>
            <Text style={styles.labelPillText}>{item.label}</Text>
          </View>
        )}
      </View>

      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>

      <Text style={styles.itemMetaText} numberOfLines={1}>
        {item.quantity} {item.unit}
      </Text>

      {item.expirationDate && (
        <Text
          style={[
            styles.expirationText,
            expiringSoon && styles.expirationTextWarning,
          ]}
          numberOfLines={1}
        >
          Expires {formatDate(item.expirationDate)}
        </Text>
      )}

      <View style={styles.cardActionsRow}>
        <Pressable style={styles.iconButton} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={18} color={COLORS.muted} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => onDelete(item)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </Pressable>
      </View>
    </View>
  );
};

export default FridgeItemCard;

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
  card: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  iconContainer: {
    marginRight: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  itemMetaText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
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
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  iconButton: {
    padding: 4,
    marginLeft: 4,
  },
});
