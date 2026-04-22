import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";

type IoniconName = keyof typeof Ionicons.glyphMap;

type TabPillProps = {
  focused: boolean;
  icon: IoniconName;
  color: string;
};

function TabPill({ focused, icon, color }: TabPillProps) {
  return (
    <View
      style={[
        pillStyles.pill,
        focused && {
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={26}
        color={focused ? "white" : "#A0A0A0"}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 85 : 70,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: "#FF4D94",
          height: 100,
        },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          headerTitle: "Ice Cream App 🍦",
          tabBarIcon: ({ focused }) => (
            <TabPill focused={focused} icon="home" color="#FF4D94" />
          ),
        }}
      />
      <Tabs.Screen
        name="Carrito"
        options={{
          title: "Pedido",
          headerTitle: "Mi Pedido",
          headerStyle: { backgroundColor: "#00BCD4", height: 100 },
          tabBarIcon: ({ focused }) => (
            <TabPill focused={focused} icon="cart" color="#00BCD4" />
          ),
        }}
      />
    </Tabs>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});
