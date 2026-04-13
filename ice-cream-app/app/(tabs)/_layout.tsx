import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00838f",
        tabBarStyle: { backgroundColor: "#fff" },
        headerShown: true, // Esto es obligatorio
        headerStyle: {
          backgroundColor: "#00838f", // Tu azul aguamarina
          height: 100, // Forzamos una altura para que se note
        },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          headerTitle: "Ice Cream App 🍦",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          headerTitle: "Panel Administrativo",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Carrito"
        options={{
          title: "Pedido",
          headerTitle: "Mi Pedido",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
