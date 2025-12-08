// src/screens/ProfileScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { COLORS as THEME_COLORS } from "../styles/groceryStyles";

const COLORS = THEME_COLORS;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout(); // clears token + user + asyncStorage
      // RootNavigator will automatically redirect to Login
    } finally {
      setLoggingOut(false);
    }
  };

  const initials =
    (user?.username || user?.email || "?")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Profile</Text>
            <Text style={styles.pageSubtitle}>
              Manage your FridgeFriend account
            </Text>
          </View>
        </View>

        {/* Content card */}
        <View style={styles.card}>
          {/* Top section with avatar + name */}
          <View style={styles.topRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.nameBlock}>
              <Text style={styles.nameText}>
                {user?.username || "FridgeFriend user"}
              </Text>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details section */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Username</Text>
              <Text style={styles.detailValue}>
                {user?.username || "—"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user?.email || "—"}</Text>
            </View>
          </View>

          {/* Logout section */}
          <View style={styles.logoutSection}>
            <Text style={styles.logoutHint}>
              You&apos;ll be signed out of this device.
            </Text>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                loggingOut && styles.logoutButtonDisabled,
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color={COLORS.card} />
              ) : (
                <Text style={styles.logoutText}>Log Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 24,
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
    flexShrink: 0,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // Top section
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.pillBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  nameBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  emailText: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.muted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.6,
    marginVertical: 12,
  },

  // Details section
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },

  // Logout section
  logoutSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
  },
  logoutHint: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 8,
  },
  logoutButton: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C84646", // matches error tone
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: COLORS.card,
    fontWeight: "600",
    fontSize: 14,
  },
});
