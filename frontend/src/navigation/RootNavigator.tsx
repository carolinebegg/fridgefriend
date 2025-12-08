// src/navigation/RootNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import GroceryScreen from "../screens/GroceryScreen";
import FridgeScreen from "../screens/FridgeScreen";
import RecipesScreen from "../screens/RecipesScreen";
import ProfileScreen from "../screens/ProfileScreen";

import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";

// ---------- Navigation Param Lists ----------

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Grocery: undefined;
  Fridge: undefined;
  Recipes: undefined;
  Profile: undefined;
};

// ---------- Colors for tabs ----------

const TAB_COLORS = {
  active: "#F6D26B", // same yellow as app
  inactive: "#8A7B6C", // muted brown
  background: "#FFFDF7",
  border: "#E5D9C5",
};

// ---------- Navigators ----------

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTabs = createBottomTabNavigator<AppTabParamList>();

function AppTabsNavigator() {
  return (
    <AppTabs.Navigator
      id="AppTabs"
      initialRouteName="Grocery"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarStyle: {
          backgroundColor: TAB_COLORS.background,
          borderTopColor: TAB_COLORS.border,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === "Fridge") {
            return (
              <MaterialCommunityIcons
                name={focused ? "fridge" : "fridge-outline"}
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Grocery") {
            // list icon for grocery list
            return <Feather name="list" size={size} color={color} />;
          }

          if (route.name === "Recipes") {
            return (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Profile") {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            );
          }

          return null;
        },
      })}
    >
      <AppTabs.Screen name="Grocery" component={GroceryScreen} />
      <AppTabs.Screen name="Fridge" component={FridgeScreen} />
      <AppTabs.Screen name="Recipes" component={RecipesScreen} />
      <AppTabs.Screen name="Profile" component={ProfileScreen} />
    </AppTabs.Navigator>
  );
}

// ---------- Root Navigator ----------

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppTabsNavigator />
      ) : (
        <AuthStack.Navigator
          id="AuthStack"
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Create Account" }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
