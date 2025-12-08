// src/components/FridgeShelf.tsx
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { FridgeItem } from "../api/fridgeApi";
import FridgeItemCard from "./FridgeItemCard";
import { FRIDGE_COLORS } from "../styles/fridgeTheme";

const COLORS = FRIDGE_COLORS;

interface FridgeShelfProps {
  label: string;
  items: FridgeItem[];
  onEdit: (item: FridgeItem) => void;
  onDelete: (item: FridgeItem) => void;
}

// Helper to get a numeric sort key from expirationDate
function getExpirationSortKey(item: FridgeItem): number {
  if (!item.expirationDate) return Number.POSITIVE_INFINITY;
  const t = new Date(item.expirationDate).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

const FridgeShelf: React.FC<FridgeShelfProps> = ({
  label,
  items,
  onEdit,
  onDelete,
}) => {
  // Sort items so soonest expiration is on the left
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const aKey = getExpirationSortKey(a);
      const bKey = getExpirationSortKey(b);
      return aKey - bKey;
    });
  }, [items]);

  return (
    <View style={styles.shelfContainer}>
      <Text style={styles.shelfTitle}>{label}</Text>

      <View style={styles.shelfSurface}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shelfRow}
        >
          {sortedItems.map((item) => (
            <FridgeItemCard
              key={item._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default FridgeShelf;

const styles = StyleSheet.create({
  shelfContainer: {
    marginBottom: 18,
  },
  shelfTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: COLORS.text,
  marginBottom: 8,
  paddingLeft: 8,     // ← Add this
},
  shelfSurface: {
    borderRadius: 18,
    backgroundColor: COLORS.shelfBg,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 2,             // thicker border
    borderColor: COLORS.borderDark, // darker brown border
  },
  shelfRow: {
    paddingVertical: 4,
  },
});
