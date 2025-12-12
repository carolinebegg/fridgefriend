import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type AiRecipeMode = "fridge" | "prompt";

const COLORS = {
  background: "#FFFDF7",
  card: "#FFFFFF",
  border: "#E5D9C5",
  text: "#3D2F25",
  muted: "#8A7B6C",
  yellow: "#F6D26B",
  yellowDark: "#D6AE3A",
  pillBg: "#FFF3C7",
};

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
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centerWrap}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <View style={styles.sheet}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                contentContainerStyle={styles.sheetContent}
                keyboardShouldPersistTaps="handled"
              >
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles-outline" size={22} color={COLORS.yellow} />
              <Text style={styles.title}>AI Recipe Ideas</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Use AI to quickly generate recipes tailored to you.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            disabled={loading}
            onPress={() => onGenerate("fridge")}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Ionicons name="restaurant-outline" size={20} color={COLORS.text} />
                <Text style={styles.primaryButtonText}>
                  Use what&apos;s in my fridge
                </Text>
              </>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.promptBox}>
            <Text style={styles.promptLabel}>
              Describe the recipe you want:
            </Text>
            <TextInput
              style={styles.promptInput}
              placeholder="e.g., 20-minute vegetarian pasta with mushrooms"
              placeholderTextColor={COLORS.muted}
              value={customPrompt}
              onChangeText={setCustomPrompt}
              multiline
            />
            <Pressable
              style={({ pressed }) => [
                styles.generateButton,
                !customPrompt.trim() && styles.generateButtonDisabled,
                pressed && customPrompt.trim() && styles.generateButtonPressed,
              ]}
              disabled={!customPrompt.trim() || loading}
              onPress={() => onGenerate("prompt", customPrompt.trim())}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color={COLORS.text} />
                  <Text style={styles.generateButtonText}>Generate</Text>
                </>
              )}
            </Pressable>
          </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  centerWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  keyboardWrap: {
    width: "100%",
    alignItems: "center",
  },
  sheet: {
  backgroundColor: COLORS.card,
  borderRadius: 20,
  paddingHorizontal: 22,
  paddingVertical: 22,
  borderWidth: 1,
  borderColor: COLORS.border,
  width: "100%",
  maxWidth: 540,
  maxHeight: "85%",
},
  sheetContent: {
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.yellowDark,
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.yellowDark,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  promptBox: {
    gap: 10,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlignVertical: "top",
  },
  generateButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.yellowDark,
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonPressed: {
    backgroundColor: COLORS.yellowDark,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
});
