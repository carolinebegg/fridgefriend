import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { COLORS as THEME_COLORS } from "../styles/groceryStyles";

type Props = NativeStackScreenProps<any, "Login">;

const COLORS = THEME_COLORS;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({
        emailOrUsername,
        password,
      });
      const { token, user } = res.data;
      await login(token, user);
      // RootNavigator will automatically switch to tabs
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError(e?.response?.data?.error || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.screen}>
          <View style={styles.card}>
            <Text style={styles.appTitle}>FridgeFriend</Text>
            <Text style={styles.subtitle}>Welcome back 👋</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email or username</Text>
              <TextInput
                placeholder="Enter your email or username"
                placeholderTextColor={COLORS.muted}
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Don&apos;t have an account?{" "}
                <Text style={styles.linkTextEmphasis}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  error: {
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 13,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: "#FFFEFA",
  },
  button: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.yellow,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 15,
  },
  linkText: {
    marginTop: 14,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 13,
  },
  linkTextEmphasis: {
    color: COLORS.yellowDark,
    fontWeight: "600",
  },
});
