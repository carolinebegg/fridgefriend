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
  const meta = getExpirationMeta(item.expirationDate);

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
        <>
          <Text
            style={[
              styles.expirationText,
              meta.style === "expiring" && styles.expirationTextWarning,
              meta.style === "expiredBold" && styles.expirationTextExpired,
            ]}
            numberOfLines={1}
          >
            {meta.primary}
          </Text>
          {meta.secondaryDate && (
            <Text style={styles.expirationDateLine} numberOfLines={1}>
              {meta.secondaryDate}
            </Text>
          )}
        </>
      )}

      {meta.showExpiredPill && (
        <View style={styles.expiredPill}>
          <Text style={styles.expiredPillText}>EXPIRED</Text>
        </View>
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
type ExpirationStyle = "muted" | "expiring" | "expiredBold";
function getExpirationMeta(raw?: string): { primary: string | null; secondaryDate: string | null; style: ExpirationStyle; showExpiredPill: boolean } {
  if (!raw) return { primary: null, secondaryDate: null, style: "muted", showExpiredPill: false };
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { primary: null, secondaryDate: null, style: "muted", showExpiredPill: false };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffDays = (startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24);
  const dateLabel = formatDate(raw);

  if (diffDays === 1) {
    return { primary: "EXPIRES TOMORROW", secondaryDate: dateLabel, style: "expiring", showExpiredPill: false };
  }
  if (diffDays === 0) {
    return { primary: "EXPIRES TODAY", secondaryDate: dateLabel, style: "expiredBold", showExpiredPill: false };
  }
  if (diffDays === -1) {
    return { primary: "EXPIRED YESTERDAY", secondaryDate: dateLabel, style: "expiredBold", showExpiredPill: true };
  }
  if (diffDays < -1) {
    return { primary: "EXPIRED", secondaryDate: dateLabel, style: "expiredBold", showExpiredPill: true };
  }
  if (diffDays === 2 || diffDays === 3) {
    return { primary: `Expires ${dateLabel}`, secondaryDate: null, style: "expiring", showExpiredPill: false };
  }
  // Future beyond 3 days
  return { primary: `Expires ${dateLabel}`, secondaryDate: null, style: "muted", showExpiredPill: false };
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
  },
  expirationTextExpired: {
    color: COLORS.error,
    fontWeight: "700",
  },
  expirationDateLine: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: "700",
  },
  expiredPill: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: COLORS.pillBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "flex-start",
  },
  expiredPillText: {
    fontSize: 10,
    color: COLORS.error,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
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
