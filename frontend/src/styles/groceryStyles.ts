// src/styles/groceryStyles.ts
import { StyleSheet } from "react-native";

// Optional: plug real font names in here if you load them with expo-font.
const FONT = {
  title: "Inter-SemiBold",
  subtitle: "Inter-Medium",
  body: "Inter-Regular",
  label: "Inter-SemiBold",
};

export const COLORS = {
  background: "#FFFDF7",
  card: "#FFFFFF",
  border: "#E5D9C5",
  divider: "#F3E7D4",
  text: "#3D2F25",
  muted: "#8A7B6C",
  yellow: "#F6D26B",
  yellowDark: "#D6AE3A",
  pillBg: "#FFF3C7",
  error: "#C84646",
  delete: "#C66A5A",
  checkboxBorder: "#D6AE3A",
  checkboxBg: "#FFFFFF",
  checkboxCheckedBg: "#F6D26B",
  checkboxCheckmark: "#3D2F25",
  labelBg: "#F6D26B",
  labelBorder: "#D6AE3A",
  labelText: "#3D2F25",
  iconMuted: "#A18C76",
};

export const groceryStyles = StyleSheet.create({
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

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "700",
    fontFamily: FONT.title,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: FONT.subtitle,
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
    fontFamily: FONT.body,
    color: COLORS.muted,
  },

  // Card / list container
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingVertical: 6,
    paddingBottom: 80,
  },

  // Empty state
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: FONT.body,
    color: COLORS.muted,
  },
  emptyTextAccent: {
    color: COLORS.text,
    fontWeight: "600",
  },

  // Item rows
  itemRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  itemRowPressed: {
    backgroundColor: "#FFF9EF",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.checkboxBorder,
    backgroundColor: COLORS.checkboxBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.checkboxCheckedBg,
    borderColor: COLORS.checkboxCheckedBg,
  },
  checkboxPressed: {
    transform: [{ scale: 0.94 }],
  },
  itemTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  chipColumn: {
    marginLeft: 12,
    justifyContent: "center",   // centers when only one chip
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: FONT.body,
    color: COLORS.text,
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    color: COLORS.muted,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  chipRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
},
  itemDetail: {
    fontSize: 13,
    fontFamily: FONT.body,
    color: COLORS.muted,
    flexShrink: 1,
  },
  itemDetailExpiring: {
    color: COLORS.error,
  },
expiringPill: {
  marginTop: 4,               // stacks below label
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 999,
  backgroundColor: COLORS.pillBg,
},
expiringPillText: {
  fontSize: 10,
  fontFamily: FONT.label,
  color: COLORS.text,
  textTransform: "uppercase",
  letterSpacing: 0.8,
},

labelPill: {
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 999,
  backgroundColor: COLORS.labelBg,
  borderWidth: 1,
  borderColor: COLORS.labelBorder,
  maxWidth: 80,
},
labelText: {
  fontSize: 10,
  fontFamily: FONT.label,
  color: COLORS.labelText,
  textTransform: "uppercase",
  letterSpacing: 0.8,
},

  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  iconButton: {
    padding: 6,
    marginLeft: 2,
    borderRadius: 999,
  },
  iconButtonPressed: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  // Floating add button (matches fridge)
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
});
