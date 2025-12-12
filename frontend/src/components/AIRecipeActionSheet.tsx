import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type AiRecipeMode = "fridge" | "random" | "prompt";

interface Props {
  visible: boolean;
  onClose: () => void;
  onGenerate: (mode: AiRecipeMode, prompt?: string) => Promise<void> | void;
  loading?: boolean;
}

export default function AIRecipeActionSheet({
  visible,
  onClose,
  onGenerate,
  loading,
}: Props) {
  const [customPrompt, setCustomPrompt] = useState("");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles-outline" size={20} />
              <Text style={styles.title}>AI Recipe Ideas</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Use AI to quickly generate recipes tailored to you.
          </Text>

          <Pressable
            style={styles.primaryButton}
            disabled={loading}
            onPress={() => onGenerate("fridge")}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Ionicons name="restaurant-outline" size={18} color="white" />
                <Text style={styles.primaryButtonText}>
                  Use what&apos;s in my fridge
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            disabled={loading}
            onPress={() => onGenerate("random")}
          >
            <Ionicons name="shuffle-outline" size={18} />
            <Text style={styles.secondaryButtonText}>Random recipe</Text>
          </Pressable>

          <View style={styles.promptBox}>
            <Text style={styles.promptLabel}>
              Or describe the recipe you want:
            </Text>
            <TextInput
              style={styles.promptInput}
              placeholder="e.g. 20-minute vegetarian pasta with mushrooms"
              value={customPrompt}
              onChangeText={setCustomPrompt}
              multiline
            />
            <Pressable
              style={[
                styles.primaryButton,
                { marginTop: 8, opacity: customPrompt.trim() ? 1 : 0.4 },
              ]}
              disabled={!customPrompt.trim() || loading}
              onPress={() => onGenerate("prompt", customPrompt.trim())}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="sparkles-outline" size={18} color="white" />
                  <Text style={styles.primaryButtonText}>Generate</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  promptBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  promptLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  promptInput: {
    minHeight: 60,
    maxHeight: 120,
    fontSize: 13,
    paddingVertical: 4,
  },
});
