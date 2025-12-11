import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../styles/groceryStyles";

const LIQUID_UNITS = ["ml", "l", "fl oz", "cup", "pint", "quart", "gallon"];
const WEIGHT_UNITS = ["g", "kg", "oz", "lb"];
const MISC_UNITS = [
  "piece",
  "pack",
  "carton",
  "loaf",
  "dozen",
  "bottle",
  "jar",
  "can",
  "bag",
  "box",
  "roll",
  "stick",
  "bunch",
  "head",
  "stalk",
  "bundle",
  "case",
  "serving",
  "slice",
  "unit",
];

export interface IngredientEditorValues {
  name: string;
  quantity?: number;
  unit?: string;
  note?: string;
}

interface IngredientEditorInitialValues {
  name: string;
  quantity: string;
  unit: string;
  note: string;
}

interface IngredientEditorModalProps {
  visible: boolean;
  initialValues: IngredientEditorInitialValues;
  onClose: () => void;
  onSubmit: (values: IngredientEditorValues) => void;
}

const IngredientEditorModal: React.FC<IngredientEditorModalProps> = ({
  visible,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initialValues.name);
  const [quantity, setQuantity] = useState(initialValues.quantity);
  const [unit, setUnit] = useState(initialValues.unit);
  const [note, setNote] = useState(initialValues.note);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [showUnitMenu, setShowUnitMenu] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialValues.name);
      setQuantity(initialValues.quantity);
      setUnit(initialValues.unit);
      setNote(initialValues.note);
      setQuantityError(null);
      setShowUnitMenu(false);
    }
  }, [visible, initialValues]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const parsedQty = quantity.trim() ? parseFloat(quantity) : undefined;
    if (quantity.trim() && (Number.isNaN(parsedQty) || (parsedQty ?? 0) <= 0)) {
      setQuantityError("Quantity must be greater than 0.");
      return;
    }

    setQuantityError(null);

    onSubmit({
      name: name.trim(),
      quantity: parsedQty,
      unit: unit.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  const selectUnit = (value: string) => {
    setUnit(value);
    setShowUnitMenu(false);
  };

  const canSubmit = name.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Ingredient</Text>

          {/* Ingredient name */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Ingredient *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Flour"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          {/* Quantity + Unit */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Quantity & unit</Text>
            <View style={styles.modalRow}>
              <View style={styles.modalHalfContainer}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="2"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={(val) => {
                    setQuantity(val);
                    if (quantityError) setQuantityError(null);
                  }}
                />
                {quantityError && (
                  <Text style={styles.errorText}>{quantityError}</Text>
                )}
              </View>

              <View style={[styles.modalHalf, styles.unitInputRow]}>
                <TextInput
                  style={[styles.modalInput, styles.unitTextInput]}
                  placeholder="cup"
                  value={unit}
                  onChangeText={setUnit}
                />
                <Pressable
                  style={styles.unitSuggestionButton}
                  onPress={() => setShowUnitMenu(true)}
                >
                  <Text style={styles.unitSuggestionButtonText}>⋯</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., sifted"
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* Buttons */}
          <View style={styles.modalButtonRow}>
            <Pressable
              style={[styles.modalButton, styles.modalButtonOutline]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonOutlineText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.modalButton,
                !canSubmit && styles.modalButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.modalButtonText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Unit suggestions modal */}
      <Modal
        visible={showUnitMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowUnitMenu(false)}
        />

        <View style={styles.unitMenu}>
          <Text style={styles.unitMenuTitle}>Liquid</Text>
          <View style={styles.unitChipsRow}>
            {LIQUID_UNITS.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.unitMenuTitle}>Weight</Text>
          <View style={styles.unitChipsRow}>
            {WEIGHT_UNITS.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.unitMenuTitle}>Misc</Text>
          <View style={styles.unitChipsRow}>
            {MISC_UNITS.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default IngredientEditorModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 18,
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: "#FFFEF9",
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  modalHalf: {
    flex: 1,
  },
  modalHalfContainer: {
    flex: 1,
    marginRight: 8,
  },
  unitInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  unitTextInput: {
    flex: 1,
    marginRight: 8,
  },
  unitSuggestionButton: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFEF9",
  },
  unitSuggestionButtonText: {
    fontSize: 16,
    color: COLORS.muted,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "transparent",
  },
  modalButtonOutlineText: {
    color: COLORS.muted,
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  unitMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  unitMenuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  unitChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.pillBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
});
