// src/components/ItemEditorModal.tsx
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
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const BASE_LABEL_OPTIONS = [
  "Dairy",
  "Grain",
  "Meat",
  "Produce",
  "Snacks",
  "Sweets",
  "Beverages",
  "Condiments",
  "Spices",
  "Canned",
  "Frozen",
  "Other",
];

const UNITS = {
  Liquid: ["ml", "l", "fl oz", "cup", "pint", "quart", "gallon", "tsp", "tbsp"],
  Weight: ["mg", "g", "kg", "oz", "lb"],
  Quantity: {
    Whole: [
      "piece",
      "item",
      "unit",
      "each",
      "whole",
      "half",
      "third",
      "quarter",
    ],
    Packs: [
      "pack",
      "package",
      "carton",
      "case",
      "dozen",
      "pair",
      "set",
    ],
    Containers: [
      "bottle",
      "jar",
      "can",
      "bag",
      "box",
      "pouch",
      "tube",
      "tray",
    ],
    Baking: [
      "loaf",
      "roll",
      "bun",
      "cake",
      "pie",
      "muffin",
      "slice",
      "sheet",
      "stick",
      "bar",
    ],
    Produce: [
      "bunch",
      "head",
      "stalk",
      "ear",
      "bundle",
      "sprig",
      "leaf",
      "clove",
    ],
    Serving: [
      "serving",
      "portion",
      "helping",
      "scoop",
      "ladleful",
      "spoonful",
      "handful",
      "pinch",
      "dash",
      "drop",
      "drizzle",
      "splash",
      "squeeze",
    ],
  },
};

// ---------- TYPES ----------

export type ItemEditorContext = "grocery" | "fridge" | "recipe";

export interface ItemEditorValues {
  name: string;
  quantity?: number;
  unit?: string;
  brand?: string;
  label?: string | null;          // category
  expirationDate?: Date | null;
  note?: string;
}

export interface ItemEditorInitialValues {
  name: string;
  quantity: string;
  unit: string;
  brand: string;
  label: string | null;
  expirationDate: Date | null;
  note: string;
}

interface ItemEditorModalProps {
  context: ItemEditorContext;
  visible: boolean;
  title: string;
  initialValues: ItemEditorInitialValues;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: ItemEditorValues) => void;

  // feature toggles
  showCategory?: boolean;
  showExpiration?: boolean;
  showNote?: boolean;

  // behaviour
  requireQuantity?: boolean;          // grocery + fridge: true, recipe: false
  labelOptions?: string[];           // defaults to BASE_LABEL_OPTIONS
}

// palette like your existing ItemEditorModal
const COLORS = {
  background: "#FFFDF7",
  card: "#FFFFFF",
  border: "#E5D9C5",
  text: "#34251A",
  muted: "#8A7B6C",
  yellow: "#F6D26B",
  yellowDark: "#D6AE3A",
  pillBg: "#FFF3C7",
  error: "#C84646",
};

const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  context,
  visible,
  title,
  initialValues,
  submitting = false,
  onClose,
  onSubmit,
  showCategory = true,
  showExpiration = true,
  showNote = false,
  requireQuantity = true,
  labelOptions = BASE_LABEL_OPTIONS,
}) => {
  const [name, setName] = useState(initialValues.name);
  const [quantity, setQuantity] = useState(initialValues.quantity);
  const [unit, setUnit] = useState(initialValues.unit);
  const [brand, setBrand] = useState(initialValues.brand);
  const [label, setLabel] = useState<string | null>(initialValues.label);
  const [expirationDate, setExpirationDate] = useState<Date | null>(
    initialValues.expirationDate
  );
  const [note, setNote] = useState(initialValues.note);

  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUnitMenu, setShowUnitMenu] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialValues.name);
      setQuantity(initialValues.quantity);
      setUnit(initialValues.unit);
      setBrand(initialValues.brand);
      setLabel(initialValues.label);
      setExpirationDate(initialValues.expirationDate);
      setNote(initialValues.note);
      setQuantityError(null);
      setShowDatePicker(false);
      setShowUnitMenu(false);
    }
  }, [visible, initialValues]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (date) {
      setExpirationDate(date);
    }
  };

  const handlePressSubmit = () => {
    if (!name.trim()) return;

    const trimmedQty = quantity.trim();
    let parsedQty: number | undefined;

    if (trimmedQty) {
      const val = parseFloat(trimmedQty);
      if (Number.isNaN(val) || val <= 0) {
        setQuantityError("Quantity must be greater than 0.");
        return;
      }
      parsedQty = val;
    } else if (requireQuantity) {
      setQuantityError("Quantity is required.");
      return;
    }

    setQuantityError(null);

    onSubmit({
      name: name.trim(),
      quantity: parsedQty,
      unit: unit.trim() || undefined,
      brand: brand.trim() || undefined,
      label,
      expirationDate: showExpiration ? expirationDate ?? null : undefined,
      note: showNote ? note.trim() || undefined : undefined,
    });
  };

  const selectUnit = (value: string) => {
    setUnit(value);
    setShowUnitMenu(false);
  };

  const canSubmit = !!name.trim() && !submitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          {/* ITEM NAME */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>
              {context === "recipe" ? "Ingredient" : "Item"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={context === "recipe" ? "Flour" : "Bread"}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* QUANTITY + UNIT */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Quantity & unit</Text>
            <View style={styles.modalRow}>
              <View style={styles.modalHalfContainer}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="1"
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
                  placeholder={
                    context === "recipe"
                      ? "cup"
                      : context === "fridge"
                      ? "container"
                      : "loaf"
                  }
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

          {/* BRAND */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Brand</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Trader Joe's"
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          {/* CATEGORY / LABEL */}
          {showCategory && (
            <View style={styles.section}>
              <Text style={styles.modalLabelHeading}>Category</Text>
              <View style={styles.labelChipsRow}>
                {labelOptions.map((option) => {
                  const isSelected = label === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() =>
                        setLabel((prev) => (prev === option ? null : option))
                      }
                      style={[
                        styles.labelChip,
                        isSelected && styles.labelChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.labelChipText,
                          isSelected && styles.labelChipTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* EXPIRATION */}
          {showExpiration && (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Expiration</Text>
              <Pressable
                style={styles.modalInputPressable}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    styles.modalInputText,
                    !expirationDate && styles.modalInputPlaceholder,
                  ]}
                >
                  {expirationDate
                    ? `Expires ${formatDate(
                        expirationDate.toISOString()
                      )}`
                    : "Expiration date"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>

              {showDatePicker && (
  <View style={{ marginTop: 8 }}>
    <DateTimePicker
      value={expirationDate || new Date()}
      mode="date"
      display={Platform.OS === "ios" ? "spinner" : "calendar"}
      onChange={handleDateChange}
      minimumDate={new Date()}
    />
  </View>
)}

            </View>
          )}

          {/* NOTES (recipe) */}
          {showNote && (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., sifted, room temp"
                value={note}
                onChangeText={setNote}
              />
            </View>
          )}

          {/* BUTTONS */}
          <View style={styles.modalButtonRow}>
            <Pressable
              style={[styles.modalButton, styles.modalButtonOutline]}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.modalButtonOutlineText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.modalButton,
                (!name.trim() || submitting) && styles.modalButtonDisabled,
              ]}
              onPress={handlePressSubmit}
              disabled={!canSubmit}
            >
              {submitting ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.modalButtonText}>
                  {title.startsWith("Edit") ? "Save" : "Add"}
                </Text>
              )}
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
        <TouchableWithoutFeedback onPress={() => setShowUnitMenu(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.unitMenu}>
          <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.unitMenuTitle}>Liquid</Text>
          <View style={styles.unitChipsRow}>
            {UNITS.Liquid.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.unitMenuTitle}>Weight</Text>
          <View style={styles.unitChipsRow}>
            {UNITS.Weight.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.unitMenuTitle}>Quantity</Text>
          <Text style={styles.unitMenuSubtitle}>Whole</Text>
          <View style={styles.unitChipsRow}>
            {UNITS.Quantity.Whole.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.unitMenuSubtitle}>Packs</Text>
          <View style={styles.unitChipsRow}>
            {UNITS.Quantity.Packs.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.unitMenuSubtitle}>Containers</Text>
          <View style={styles.unitChipsRow}>
            {UNITS.Quantity.Containers.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.unitMenuSubtitle}>Baking</Text>
          <View style={styles.unitChipsRow}>
            {UNITS.Quantity.Baking.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.unitMenuSubtitle}>Produce</Text>
          <View style={styles.unitChipsRow}>
            {UNITS.Quantity.Produce.map((u) => (
              <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                <Text style={styles.unitChipText}>{u}</Text>
              </Pressable>
            ))}
          </View>
          {context === "recipe" && (
            <>
              <Text style={styles.unitMenuSubtitle}>Serving</Text>
              <View style={styles.unitChipsRow}>
                {UNITS.Quantity.Serving.map((u) => (
                  <Pressable key={u} style={styles.unitChip} onPress={() => selectUnit(u)}>
                    <Text style={styles.unitChipText}>{u}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          </ScrollView>
        </View>
      </Modal>
    </Modal>
  );
};

export default ItemEditorModal;

// ---------- helpers & styles ----------

function formatDate(raw: string | undefined) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

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
    marginBottom: 12,
  },
  section: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.muted,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
  },
  modalInputPressable: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalInputText: {
    fontSize: 14,
    color: COLORS.text,
  },
  modalInputPlaceholder: {
    color: COLORS.muted,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalHalf: {
    flex: 1,
  },
  modalHalfContainer: {
    flex: 1,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.yellow,
    marginLeft: 8,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 14,
  },
  modalButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonOutlineText: {
    color: COLORS.muted,
    fontWeight: "500",
    fontSize: 14,
  },
  modalLabelHeading: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 6,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  labelChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  labelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  labelChipSelected: {
    backgroundColor: COLORS.pillBg,
    borderColor: COLORS.yellowDark,
  },
  labelChipText: {
    fontSize: 13,
    color: COLORS.text,
  },
  labelChipTextSelected: {
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6E7A9",
  },
  unitSuggestionButtonText: {
    fontSize: 18,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  unitMenu: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 40,
    maxHeight: "70%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  unitMenuTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
    color: COLORS.text,
  },
  unitMenuSubtitle: {
    fontWeight: "500",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
    color: COLORS.muted,
  },
  unitChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F3D47A",
    backgroundColor: "#FFF9DD",
    marginRight: 8,
    marginBottom: 8,
  },
  unitChipText: {
    fontSize: 13,
    color: COLORS.text,
  },
});
