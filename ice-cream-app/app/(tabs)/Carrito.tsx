import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext";

export default function CarritoScreen() {
  const { cart, clearCart, totalPrice } = useCart();
  const [cliente, setCliente] = useState({
    nombre: "",
    direccion: "",
    barrio: "",
    celular: "",
    notas: "",
  });

  const enviarWhatsApp = () => {
    if (
      !cliente.nombre ||
      !cliente.direccion ||
      !cliente.celular ||
      !cliente.barrio
    ) {
      Alert.alert(
        "Faltan datos",
        "Por favor completa nombre, dirección, barrio y celular.",
      );
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Agrega algunos helados primero.");
      return;
    }

    const mensaje =
      `*🍦 NUEVO PEDIDO - ICE CREAM APP*\n\n` +
      `*Cliente:* ${cliente.nombre}\n` +
      `*Celular:* ${cliente.celular}\n` +
      `*Dirección:* ${cliente.direccion}\n` +
      `*Barrio:* ${cliente.barrio}\n` +
      `--------------------------\n` +
      `*Detalle del Pedido:*\n${cart.map((i) => `- ${i.name} (x${i.quantity})`).join("\n")}\n` +
      `--------------------------\n` +
      `*Total:* $${totalPrice}\n` +
      `*Notas:* ${cliente.notas || "Sin notas"}`;

    const url = `https://wa.me/573043800967?text=${encodeURIComponent(mensaje)}`; // CAMBIA EL NÚMERO AQUÍ
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Mi Pedido 🛒</Text>

      <View style={styles.cardContainer}>
        {cart.length > 0 ? (
          cart.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Ionicons name="ice-cream" size={24} color="#00838f" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>
                  Cantidad: {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ${item.price * item.quantity}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No has agregado helados aún.</Text>
        )}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Datos de Entrega</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          onChangeText={(t) => setCliente({ ...cliente, nombre: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Número de Celular"
          keyboardType="phone-pad"
          onChangeText={(t) => setCliente({ ...cliente, celular: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Dirección Exacta"
          onChangeText={(t) => setCliente({ ...cliente, direccion: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Barrio"
          onChangeText={(t) => setCliente({ ...cliente, barrio: t })}
        />
        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Notas Adicionales"
          multiline
          onChangeText={(t) => setCliente({ ...cliente, notas: t })}
        />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${totalPrice}</Text>
        </View>

        <TouchableOpacity style={styles.btnWhatsapp} onPress={enviarWhatsApp}>
          <Ionicons name="logo-whatsapp" size={24} color="white" />
          <Text style={styles.btnText}>Enviar pedido a WhatsApp</Text>
        </TouchableOpacity>

        {cart.length > 0 && (
          <TouchableOpacity
            style={{ marginTop: 15, alignItems: "center" }}
            onPress={clearCart}
          >
            <Text style={{ color: "#d32f2f", fontWeight: "bold" }}>
              Vaciar Carrito
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0f7fa", padding: 20 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#006064",
    marginTop: 40,
    marginBottom: 20,
  },
  cardContainer: { marginBottom: 20 },
  itemCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  itemTitle: { fontWeight: "bold", fontSize: 16 },
  itemSubtitle: { color: "#666", fontSize: 12 },
  itemPrice: { fontWeight: "bold", color: "#00838f" },
  formCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#006064",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#b2ebf2",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 24, fontWeight: "bold", color: "#00838f" },
  btnWhatsapp: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
  },
  btnText: { color: "white", fontWeight: "bold", marginLeft: 10 },
  emptyText: {
    textAlign: "center",
    color: "#006064",
    fontStyle: "italic",
    padding: 20,
  },
});
