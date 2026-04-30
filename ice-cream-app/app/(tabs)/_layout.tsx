import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useCart } from "../../context/CartContext";

type IoniconName = keyof typeof Ionicons.glyphMap;

type TabPillProps = {
  focused: boolean;
  icon: IoniconName;
  color: string;
  badge?: number;
};

function TabPill({ focused, icon, color, badge }: TabPillProps) {
  return (
    <View style={pillStyles.container}>
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

      {!!badge && badge > 0 && (
        <View style={pillStyles.badge}>
          <Text style={pillStyles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      )}
    </View>
  );
}

// Wrapper para leer del CartContext (los hooks solo funcionan dentro de componentes)
function CartTabIcon({ focused }: { focused: boolean }) {
  const { cart } = useCart();
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  return (
    <TabPill focused={focused} icon="cart" color="#00BCD4" badge={totalItems} />
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
          headerShown: false,
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
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const pillStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pill: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: "#FF1744",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#FF1744",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900",
  },
});
