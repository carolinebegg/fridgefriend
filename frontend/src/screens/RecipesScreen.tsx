// src/screens/RecipesScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS as THEME_COLORS } from "../styles/groceryStyles";

const COLORS = THEME_COLORS;

export default function RecipesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Recipes</Text>
            <Text style={styles.pageSubtitle}>Your personal cookbook</Text>
          </View>
        </View>

        {/* Card container */}
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Empty state for now */}
            <View style={styles.emptyContainer}>
              <Ionicons
                name="book-outline"
                size={48}
                color={COLORS.muted}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyTitle}>No recipes yet</Text>
              <Text style={styles.emptyText}>
                Add your first recipe using the{" "}
                <Text style={styles.emptyTextAccent}>plus</Text> button.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Floating Add Button */}
        <Pressable style={styles.fab} onPress={() => console.log("TODO: add recipe")}>
          <Ionicons name="add" size={30} color={COLORS.text} />
        </Pressable>
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
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    marginTop: 6,
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

  listContent: {
    flexGrow: 1,
    paddingVertical: 6,
    paddingBottom: 80,
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

  // Floating Add Button
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
