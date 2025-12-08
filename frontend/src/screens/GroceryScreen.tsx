// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { groceryApi, GroceryItem } from "../api/groceryApi";
// import ItemEditorModal, {
//   ItemEditorValues,
// } from "../components/ItemEditorModal";

// const COLORS = {
//   background: "#FFFDF7", // warm white
//   card: "#FFFFFF",
//   border: "#E5D9C5",
//   text: "#3D2F25", // soft coffee brown
//   muted: "#8A7B6C",
//   yellow: "#F6D26B",
//   yellowDark: "#D6AE3A",
//   pillBg: "#FFF3C7",
//   delete: "#C66A5A",
//   error: "#C84646",
// };

// const GroceryScreen: React.FC = () => {
//   const [items, setItems] = useState<GroceryItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [editorVisible, setEditorVisible] = useState(false);
//   const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const fetchGroceries = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await groceryApi.getAll();
//       setItems(res.data);
//     } catch (err) {
//       console.error("Failed to load groceries", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchGroceries();
//   }, [fetchGroceries]);

//   const handleToggle = async (id: string) => {
//     try {
//       const res = await groceryApi.toggle(id);
//       const updated = res.data;
//       setItems((prev) =>
//         prev.map((item) => (item._id === updated._id ? updated : item))
//       );
//     } catch (err) {
//       console.error("Failed to toggle grocery item", err);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await groceryApi.remove(id);
//       setItems((prev) => prev.filter((item) => item._id !== id));
//     } catch (err) {
//       console.error("Failed to delete grocery item", err);
//     }
//   };

//   const openAddModal = () => {
//     setEditingItem(null);
//     setEditorVisible(true);
//   };

//   const openEditModal = (item: GroceryItem) => {
//     setEditingItem(item);
//     setEditorVisible(true);
//   };

//   const handleEditorClose = () => {
//     if (submitting) return;
//     setEditorVisible(false);
//     setEditingItem(null);
//   };

//   const handleEditorSubmit = async (values: ItemEditorValues) => {
//     const { name, quantity, unit, label, expirationDate } = values;

//     try {
//       setSubmitting(true);

//       if (editingItem) {
//         // Update existing item
//         const res = await groceryApi.update(editingItem._id, {
//           name,
//           quantity,
//           unit,
//           label: label ?? undefined,
//           expirationDate: expirationDate
//             ? expirationDate.toISOString()
//             : undefined,
//         });
//         const updated = res.data;
//         setItems((prev) =>
//           prev.map((it) => (it._id === updated._id ? updated : it))
//         );
//       } else {
//         // Create new item
//         const res = await groceryApi.create({
//           name,
//           quantity,
//           unit,
//           label: label ?? undefined,
//           expirationDate: expirationDate
//             ? expirationDate.toISOString()
//             : undefined,
//         });
//         setItems((prev) => [res.data, ...prev]);
//       }

//       setEditorVisible(false);
//       setEditingItem(null);
//     } catch (err) {
//       console.error("Failed to save grocery item", err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const renderItem = ({ item }: { item: GroceryItem }) => {
//     const expiringSoon = isExpiringSoon(item.expirationDate);

//     return (
//       <View style={styles.itemRow}>
//         <Pressable
//           onPress={() => handleToggle(item._id)}
//           style={[
//             styles.checkbox,
//             item.isChecked && styles.checkboxChecked,
//           ]}
//         >
//           {item.isChecked && <Text style={styles.checkmark}>✓</Text>}
//         </Pressable>

//         <View style={styles.itemTextContainer}>
//           <Text
//             style={[
//               styles.itemName,
//               item.isChecked && styles.itemNameChecked,
//             ]}
//             numberOfLines={1}
//           >
//             {item.name}
//           </Text>
//           <Text
//             style={[
//               styles.itemDetail,
//               expiringSoon && styles.itemDetailExpiring,
//             ]}
//             numberOfLines={1}
//           >
//             {item.quantity} {item.unit}
//             {item.expirationDate
//               ? `  ·  Expires ${formatDate(item.expirationDate)}`
//               : ""}
//           </Text>
//         </View>

//         {item.label ? (
//           <View style={styles.labelPill}>
//             <Text style={styles.labelText}>{item.label}</Text>
//           </View>
//         ) : null}

//         {/* Edit button */}
//         <Pressable
//           onPress={() => openEditModal(item)}
//           style={styles.editButton}
//         >
//           <Text style={styles.editText}>Edit</Text>
//         </Pressable>

//         <Pressable
//           onPress={() => handleDelete(item._id)}
//           style={styles.deleteButton}
//         >
//           <Text style={styles.deleteText}>×</Text>
//         </Pressable>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.screen}>
//       <Text style={styles.pageTitle}>Grocery List</Text>

//       <View style={styles.card}>
//         {loading ? (
//           <ActivityIndicator />
//         ) : (
//           <FlatList
//             data={items}
//             keyExtractor={(item) => item._id}
//             renderItem={renderItem}
//             contentContainerStyle={
//               items.length === 0 ? styles.emptyContainer : undefined
//             }
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>
//                 Your list is empty — time to shop.
//               </Text>
//             }
//           />
//         )}
//       </View>

//       {/* Floating add button */}
//       <Pressable style={styles.fab} onPress={openAddModal}>
//         <Text style={styles.fabText}>＋</Text>
//       </Pressable>

//       {/* Shared Add/Edit modal */}
//       <ItemEditorModal
//         visible={editorVisible}
//         title={editingItem ? "Edit Item" : "Add Item"}
//         submitting={submitting}
//         onClose={handleEditorClose}
//         initialValues={{
//           name: editingItem?.name ?? "",
//           quantity: editingItem ? String(editingItem.quantity) : "1",
//           unit: editingItem?.unit ?? "piece",
//           label: editingItem?.label ?? null,
//           expirationDate: editingItem?.expirationDate
//             ? new Date(editingItem.expirationDate)
//             : null,
//         }}
//         onSubmit={handleEditorSubmit}
//       />
//     </View>
//   );
// };

// function formatDate(raw: string | undefined) {
//   if (!raw) return "";
//   const d = new Date(raw);
//   if (Number.isNaN(d.getTime())) return raw;
//   return d.toLocaleDateString(undefined, {
//     month: "short",
//     day: "numeric",
//   });
// }

// // within 3 days (including today), future only
// function isExpiringSoon(raw?: string) {
//   if (!raw) return false;
//   const now = new Date();
//   const d = new Date(raw);
//   if (Number.isNaN(d.getTime())) return false;
//   const diffMs = d.getTime() - now.getTime();
//   const diffDays = diffMs / (1000 * 60 * 60 * 24);
//   return diffDays >= 0 && diffDays <= 3;
// }

// export default GroceryScreen;

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     paddingHorizontal: 18,
//     paddingTop: 24,
//   },
//   pageTitle: {
//     fontSize: 28,
//     fontWeight: "600",
//     color: COLORS.text,
//     marginBottom: 16,
//   },
//   card: {
//     flex: 1,
//     backgroundColor: COLORS.card,
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   itemRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0E6D8",
//   },
//   checkbox: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: COLORS.yellowDark,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//     backgroundColor: COLORS.card,
//   },
//   checkboxChecked: {
//     backgroundColor: COLORS.yellow,
//   },
//   checkmark: {
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   itemTextContainer: {
//     flex: 1,
//   },
//   itemName: {
//     fontSize: 16,
//     color: COLORS.text,
//     fontWeight: "500",
//   },
//   itemNameChecked: {
//     textDecorationLine: "line-through",
//     color: COLORS.muted,
//   },
//   itemDetail: {
//     fontSize: 12,
//     color: COLORS.muted,
//     marginTop: 2,
//   },
//   itemDetailExpiring: {
//     color: COLORS.error,
//   },
//   labelPill: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//     backgroundColor: COLORS.pillBg,
//     borderWidth: 1,
//     borderColor: COLORS.yellowDark,
//     marginLeft: 8,
//   },
//   labelText: {
//     fontSize: 11,
//     color: COLORS.text,
//     fontWeight: "500",
//   },
//   editButton: {
//     marginLeft: 8,
//     paddingHorizontal: 6,
//     paddingVertical: 4,
//   },
//   editText: {
//     fontSize: 12,
//     color: COLORS.text,
//   },
//   deleteButton: {
//     marginLeft: 6,
//     padding: 4,
//   },
//   deleteText: {
//     fontSize: 18,
//     color: COLORS.delete,
//     lineHeight: 18,
//   },
//   emptyContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyText: {
//     color: COLORS.muted,
//     fontSize: 14,
//   },

//   // FAB
//   fab: {
//     position: "absolute",
//     bottom: 30,
//     alignSelf: "center",
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: COLORS.yellow,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.12,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   fabText: {
//     fontSize: 34,
//     color: COLORS.text,
//     lineHeight: 34,
//   },
// });

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { groceryApi, GroceryItem } from "../api/groceryApi";
import ItemEditorModal, {
  ItemEditorValues,
} from "../components/ItemEditorModal";
import { groceryStyles as styles, COLORS } from "../styles/groceryStyles";

const GroceryScreen: React.FC = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchGroceries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await groceryApi.getAll();
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load groceries", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroceries();
  }, [fetchGroceries]);

  const handleToggle = async (id: string) => {
    try {
      const res = await groceryApi.toggle(id);
      const updated = res.data;
      setItems((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (err) {
      console.error("Failed to toggle grocery item", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await groceryApi.remove(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Failed to delete grocery item", err);
    }
  };

  const handleClearList = async () => {
    if (items.length === 0 || clearing) return;

    try {
      setClearing(true);
      // Simple version: delete each item (can be replaced with a real "clear" endpoint)
      await Promise.all(items.map((item) => groceryApi.remove(item._id)));
      setItems([]);
    } catch (err) {
      console.error("Failed to clear grocery list", err);
    } finally {
      setClearing(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setEditorVisible(true);
  };

  const openEditModal = (item: GroceryItem) => {
    setEditingItem(item);
    setEditorVisible(true);
  };

  const handleEditorClose = () => {
    if (submitting) return;
    setEditorVisible(false);
    setEditingItem(null);
  };

  const handleEditorSubmit = async (values: ItemEditorValues) => {
    const { name, quantity, unit, label, expirationDate } = values;

    try {
      setSubmitting(true);

      if (editingItem) {
        const res = await groceryApi.update(editingItem._id, {
          name,
          quantity,
          unit,
          label: label ?? undefined,
          expirationDate: expirationDate
            ? expirationDate.toISOString()
            : undefined,
        });
        const updated = res.data;
        setItems((prev) =>
          prev.map((it) => (it._id === updated._id ? updated : it))
        );
      } else {
        const res = await groceryApi.create({
          name,
          quantity,
          unit,
          label: label ?? undefined,
          expirationDate: expirationDate
            ? expirationDate.toISOString()
            : undefined,
        });
        setItems((prev) => [res.data, ...prev]);
      }

      setEditorVisible(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save grocery item", err);
    } finally {
      setSubmitting(false);
    }
  };

const renderItem = ({ item }: { item: GroceryItem }) => {
  const expiringSoon = isExpiringSoon(item.expirationDate);

  return (
    <View style={styles.itemRowContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.itemRow,
          pressed && styles.itemRowPressed,
        ]}
        onPress={() => handleToggle(item._id)}
      >
        {/* checkbox */}
        <Pressable
          onPress={() => handleToggle(item._id)}
          style={({ pressed }) => [
            styles.checkbox,
            item.isChecked && styles.checkboxChecked,
            pressed && styles.checkboxPressed,
          ]}
          hitSlop={6}
        >
          {item.isChecked && (
            <Ionicons
              name="checkmark"
              size={16}
              color={COLORS.checkboxCheckmark}
            />
          )}
        </Pressable>

        {/* main text */}
        <View style={styles.itemTextContainer}>
          <Text
            style={[
              styles.itemName,
              item.isChecked && styles.itemNameChecked,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.itemDetail,
              expiringSoon && styles.itemDetailExpiring,
            ]}
            numberOfLines={1}
          >
            {item.quantity} {item.unit}
            {item.expirationDate
              ? `  ·  Expires ${formatDate(item.expirationDate)}`
              : ""}
          </Text>
        </View>

        {/* vertical chip column: label on top, SOON below */}
        <View style={styles.chipColumn}>
          {item.label ? (
            <View style={styles.labelPill}>
              <Text style={styles.labelText}>{item.label}</Text>
            </View>
          ) : null}
          {expiringSoon && (
            <View style={styles.expiringPill}>
              <Text style={styles.expiringPillText}>Soon</Text>
            </View>
          )}
        </View>

        {/* actions */}
        <View style={styles.itemActions}>
          <Pressable
            onPress={() => openEditModal(item)}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            hitSlop={8}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={COLORS.iconMuted}
            />
          </Pressable>
          <Pressable
            onPress={() => handleDelete(item._id)}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.delete} />
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
};

  const remaining = items.filter((i) => !i.isChecked).length;
  const remainingWord = remaining === 1 ? "item" : "items";
  const totalWord = items.length === 1 ? "item" : "items";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Grocery List</Text>
            <Text style={styles.pageSubtitle}>
              {remaining} {remainingWord} left · {items.length}{" "}
              {totalWord}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                (clearing || items.length === 0) && styles.clearButtonDisabled,
                pressed && !clearing && items.length !== 0
                  ? styles.clearButtonPressed
                  : null,
              ]}
              onPress={handleClearList}
              disabled={clearing || items.length === 0}
            >
              {clearing ? (
                <ActivityIndicator size="small" color={COLORS.muted} />
              ) : (
                <Text style={styles.clearButtonText}>Clear</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* List card */}
        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.yellowDark} />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={[
                styles.listContent,
                items.length === 0 && styles.emptyContainer,
              ]}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Your list is clear. Add what you need with the{" "}
                  <Text style={styles.emptyTextAccent}>plus</Text> button.
                </Text>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>

      {/* Floating add button, like Fridge */}
      <Pressable style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color={COLORS.text} />
      </Pressable>

      {/* Shared Add/Edit modal */}
      <ItemEditorModal
        visible={editorVisible}
        title={editingItem ? "Edit Grocery Item" : "Add Grocery Item"}
        submitting={submitting}
        onClose={handleEditorClose}
        initialValues={{
          name: editingItem?.name ?? "",
          quantity: editingItem ? String(editingItem.quantity) : "1",
          unit: editingItem?.unit ?? "piece",
          label: editingItem?.label ?? null,
          expirationDate: editingItem?.expirationDate
            ? new Date(editingItem.expirationDate)
            : null,
        }}
        onSubmit={handleEditorSubmit}
      />
    </SafeAreaView>
  );
};

function formatDate(raw: string | undefined) {
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

export default GroceryScreen;
