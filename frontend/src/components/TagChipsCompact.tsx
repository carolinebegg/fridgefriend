// frontend/src/components/TagChipsCompact.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";

import { COLORS } from "../styles/groceryStyles"; // or recipeStyles – adjust import

interface ColorScheme {
  chipBg: string;
  chipBorder: string;
  chipText: string;
  moreChipBg: string;
  moreChipText: string;
}

interface TagChipsCompactProps {
  tags: string[];
  remainingCount?: number;
  style?: ViewStyle;
  maxVisible?: number; // optional – if you want component to slice itself
  onPressTag?: (tag: string) => void;
  onPressMore?: () => void;
  colorScheme?: ColorScheme;
}

const defaultColors: ColorScheme = {
  chipBg: COLORS.pillBg ?? "#F3F4F6",
  chipBorder: COLORS.border ?? "#E5E7EB",
  chipText: COLORS.text ?? "#3D2F25",
  moreChipBg: COLORS.background ?? "#E5E7EB",
  moreChipText: COLORS.text ?? "#3D2F25",
};

const TagChipsCompact: React.FC<TagChipsCompactProps> = ({
  tags,
  remainingCount = 0,
  style,
  maxVisible,
  onPressTag,
  onPressMore,
  colorScheme = defaultColors,
}) => {
  if (!tags || tags.length === 0) return null;

  const effectiveTags =
    typeof maxVisible === "number" ? tags.slice(0, maxVisible) : tags;

  return (
    <View style={[styles.container, style]}>
      {effectiveTags.map((tag) => (
        <Pressable
          key={tag}
          style={[
            styles.chip,
            {
              backgroundColor: colorScheme.chipBg,
              borderColor: colorScheme.chipBorder,
            },
          ]}
          onPress={() => onPressTag?.(tag)}
          hitSlop={4}
        >
          <Text
            style={[
              styles.chipText,
              {
                color: colorScheme.chipText,
              },
            ]}
            numberOfLines={1}
          >
            {tag}
          </Text>
        </Pressable>
      ))}

      {remainingCount > 0 && (
        <Pressable
          style={[
            styles.chip,
            styles.moreChip,
            {
              backgroundColor: colorScheme.moreChipBg,
              borderColor: colorScheme.chipBorder,
            },
          ]}
          onPress={onPressMore}
          hitSlop={4}
        >
          <Text
            style={[
              styles.chipText,
              styles.moreChipText,
              {
                color: colorScheme.moreChipText,
              },
            ]}
          >
            +{remainingCount}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default TagChipsCompact;

// ---------- styles ----------

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
  },
  moreChip: {
    paddingHorizontal: 10,
  },
  moreChipText: {
    fontWeight: "600",
  },
});
