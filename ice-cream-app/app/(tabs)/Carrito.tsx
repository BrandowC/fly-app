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
import api from "../../services/api";

// Mismas paletas que en home.tsx para mantener coherencia visual
const PALETAS = [
  { bg: "#FFE4EE", accent: "#FF4D94" },
  { bg: "#FFF3E0", accent: "#FF9800" },
  { bg: "#E0F7FA", accent: "#00BCD4" },
  { bg: "#F3E5F5", accent: "#AB47BC" },
  { bg: "#FFF9C4", accent: "#FBC02D" },
  { bg: "#C8E6C9", accent: "#43A047" },
  { bg: "#FFCCBC", accent: "#E64A19" },
  { bg: "#D1C4E9", accent: "#5E35B1" },
];

// Mapeo de emojis (coincide con home.tsx)
const getEmoji = (nombre: string): string => {
  const n = nombre.toLowerCase();
  if (n.includes("pequeño") || n.includes("mediano") || n.includes("grande"))
    return "🥤";
  if (n.includes("fresa")) return "🍓";
  if (n.includes("chocolate") && n.includes("helado")) return "🍫";
  if (n.includes("chocolate derretido")) return "🍫";
  if (n.includes("vainilla")) return "🍦";
  if (n.includes("mora")) return "🫐";
  if (n.includes("napolitano")) return "🍨";
  if (n.includes("limón") || n.includes("limon")) return "🍋";
  if (n.includes("maracuyá") || n.includes("maracuya")) return "🥭";
  if (n.includes("coco")) return "🥥";
  if (n.includes("caramelo")) return "🍯";
  if (n.includes("arequipe")) return "🥄";
  if (n.includes("leche")) return "🥛";
  if (n.includes("chispas")) return "🍫";
  if (n.includes("maní") || n.includes("mani")) return "🥜";
  if (n.includes("almendras")) return "🌰";
  if (n.includes("oreo") || n.includes("galleta")) return "🍪";
  if (n.includes("banano") || n.includes("banana")) return "🍌";
  if (n.includes("chantilly") || n.includes("crema")) return "🍰";
  if (n.includes("gomitas")) return "🍬";
  return "🍨";
};

const FORM_FIELDS: {
  key: "nombre" | "celular" | "direccion" | "barrio" | "notas";
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
}[] = [
  {
    key: "nombre",
    label: "Nombre Completo",
    placeholder: "Ej: María Pérez",
    icon: "person",
    color: "#FF4D94",
  },
  {
    key: "celular",
    label: "Celular",
    placeholder: "Ej: 3101234567",
    icon: "call",
    color: "#43A047",
    keyboardType: "phone-pad",
  },
  {
    key: "direccion",
    label: "Dirección Exacta",
    placeholder: "Ej: Calle 10 # 5-20",
    icon: "location",
    color: "#FF9800",
  },
  {
    key: "barrio",
    label: "Barrio",
    placeholder: "Ej: Centro",
    icon: "map",
    color: "#AB47BC",
  },
  {
    key: "notas",
    label: "Notas Adicionales",
    placeholder: "Ej: Sin nueces, porfa",
    icon: "create",
    color: "#00BCD4",
    multiline: true,
  },
];

export default function CarritoScreen() {
  const { cart, clearCart, totalPrice, increaseQty, decreaseQty, removeFromCart } =
    useCart();
  const [cliente, setCliente] = useState({
    nombre: "",
    direccion: "",
    barrio: "",
    celular: "",
    notas: "",
  });

  // Convierte los items del carrito al formato que espera el backend
  const buildItemsForBackend = () => {
    const items: { productoId: number; toppingId?: number }[] = [];

    // Buscamos un producto (helado o tamaño) para "anclar" los toppings
    const productoAncla = cart.find(
      (i) => i.id.startsWith("helado-") || i.id.startsWith("tamano-"),
    );
    const productoAnclaId = productoAncla
      ? Number(productoAncla.id.split("-")[1])
      : null;

    for (const item of cart) {
      const [categoria, idStr] = item.id.split("-");
      const id = Number(idStr);
      if (!id) continue;

      // Duplicamos el detalle por cada unidad en la cantidad
      for (let i = 0; i < item.quantity; i++) {
        if (categoria === "topping") {
          if (productoAnclaId) {
            items.push({ productoId: productoAnclaId, toppingId: id });
          }
        } else {
          items.push({ productoId: id });
        }
      }
    }

    return items;
  };

  const enviarWhatsApp = async () => {
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

    const items = buildItemsForBackend();
    if (items.length === 0) {
      Alert.alert("Error", "No hay productos válidos en el carrito.");
      return;
    }

    // 1) Guardar el pedido en el backend
    try {
      await api.post("/pedidos", {
        clienteNombre: cliente.nombre,
        telefono: cliente.celular,
        direccion: `${cliente.direccion}, Barrio ${cliente.barrio}`,
        items,
      });
    } catch (error: any) {
      console.log("Error guardando pedido:", error?.response?.data || error?.message);
      Alert.alert(
        "Error al enviar",
        "No se pudo registrar tu pedido. Revisa tu conexión e inténtalo de nuevo.",
      );
      return;
    }

    // 2) Abrir WhatsApp con el resumen
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

    const url = `https://wa.me/573043800967?text=${encodeURIComponent(mensaje)}`;
    Linking.openURL(url);

    // 3) Limpiar el carrito después de enviar
    clearCart();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Eliminar producto", `¿Quitar "${name}" del carrito?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeFromCart(id),
      },
    ]);
  };

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Resumen superior (sin título duplicado, ya está en el header del tab) */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryCount}>
          {totalItems} {totalItems === 1 ? "producto" : "productos"}
        </Text>
        <View style={styles.headerTotalPill}>
          <Text style={styles.headerTotalLabel}>Total</Text>
          <Text style={styles.headerTotalValue}>${totalPrice}</Text>
        </View>
      </View>

      {/* LISTA DE PRODUCTOS */}
      <View style={styles.cardContainer}>
        {cart.length > 0 ? (
          cart.map((item, idx) => {
            const paleta = PALETAS[idx % PALETAS.length];
            return (
              <View
                key={item.id}
                style={[styles.itemCard, { backgroundColor: paleta.bg }]}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.emoji}>{getEmoji(item.name)}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: paleta.accent }]}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${item.price} c/u
                  </Text>

                  {/* BOTONES +/- */}
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { borderColor: paleta.accent }]}
                      onPress={() => decreaseQty(item.id)}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={paleta.accent}
                      />
                    </TouchableOpacity>

                    <Text style={[styles.qtyText, { color: paleta.accent }]}>
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: paleta.accent }]}
                      onPress={() => increaseQty(item.id)}
                    >
                      <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.rightSide}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                  >
                    <Ionicons name="trash" size={18} color="#E53935" />
                  </TouchableOpacity>
                  <Text style={[styles.subtotal, { color: paleta.accent }]}>
                    ${item.price * item.quantity}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🍦</Text>
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptySubtitle}>
              Agrega algunos helados desde Inicio
            </Text>
          </View>
        )}
      </View>

      {/* FORMULARIO */}
      <View style={styles.formCard}>
        <View style={styles.formHeader}>
          <View style={styles.formHeaderIcon}>
            <Text style={styles.formHeaderEmoji}>🏍️</Text>
          </View>
          <View>
            <Text style={styles.formTitle}>Datos de Entrega</Text>
            <Text style={styles.formSubtitle}>
              Para enviar tu pedido a domicilio
            </Text>
          </View>
        </View>

        {FORM_FIELDS.map((field) => (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: field.color }]}>
              {field.label}
            </Text>
            <View
              style={[
                styles.inputBox,
                { borderColor: field.color },
                field.multiline && { alignItems: "flex-start" },
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: field.color + "22" },
                ]}
              >
                <Ionicons name={field.icon} size={18} color={field.color} />
              </View>
              <TextInput
                style={[
                  styles.input,
                  field.multiline && { minHeight: 60, textAlignVertical: "top" },
                ]}
                placeholder={field.placeholder}
                placeholderTextColor="#BBB"
                keyboardType={field.keyboardType || "default"}
                multiline={field.multiline}
                value={cliente[field.key]}
                onChangeText={(t) =>
                  setCliente({ ...cliente, [field.key]: t })
                }
              />
            </View>
          </View>
        ))}

        {/* TOTAL RESUMEN */}
        <View style={styles.totalBox}>
          <View style={styles.totalRowLine}>
            <Text style={styles.totalRowLabel}>Productos</Text>
            <Text style={styles.totalRowValue}>{totalItems}</Text>
          </View>
          <View style={styles.totalRowLine}>
            <Text style={styles.totalRowLabel}>Subtotal</Text>
            <Text style={styles.totalRowValue}>${totalPrice}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalRowLine}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>${totalPrice}</Text>
          </View>
        </View>

        {/* BOTÓN WHATSAPP */}
        <TouchableOpacity
          style={styles.btnWhatsapp}
          onPress={enviarWhatsApp}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={24} color="white" />
          <Text style={styles.btnText}>Enviar pedido a WhatsApp</Text>
        </TouchableOpacity>

        {cart.length > 0 && (
          <TouchableOpacity style={styles.btnClear} onPress={clearCart}>
            <Ionicons name="trash-outline" size={18} color="#d32f2f" />
            <Text style={styles.btnClearText}>Vaciar Carrito</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8FB" },

  // HEADER
  headerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  summaryCount: {
    fontSize: 15,
    color: "#666",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#777",
    fontWeight: "500",
    marginTop: 2,
  },
  headerTotalPill: {
    backgroundColor: "#FF4D94",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#FF4D94",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  headerTotalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
  },
  headerTotalValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },

  cardContainer: { padding: 16 },

  // ITEM CARD
  itemCard: {
    padding: 14,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emoji: { fontSize: 32 },
  itemTitle: { fontWeight: "800", fontSize: 15 },
  itemPrice: { color: "#666", fontSize: 12, marginTop: 2, fontWeight: "600" },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 2,
  },
  qtyText: {
    fontWeight: "800",
    fontSize: 16,
    minWidth: 22,
    textAlign: "center",
  },

  rightSide: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
  },
  subtotal: { fontWeight: "900", fontSize: 15 },

  // EMPTY
  emptyBox: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 40,
    marginHorizontal: 4,
  },
  emptyEmoji: { fontSize: 60, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#333" },
  emptySubtitle: { color: "#999", marginTop: 4, fontSize: 13 },

  // FORM
  formCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  formHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF4D94",
    alignItems: "center",
    justifyContent: "center",
  },
  formHeaderEmoji: {
    fontSize: 26,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  formSubtitle: { color: "#777", fontSize: 12 },

  fieldContainer: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 10,
  },
  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },

  // TOTAL BOX
  totalBox: {
    backgroundColor: "#FFF0F5",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  totalRowLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalRowLabel: { color: "#666", fontSize: 13, fontWeight: "600" },
  totalRowValue: { color: "#333", fontSize: 14, fontWeight: "700" },
  totalDivider: {
    height: 1,
    backgroundColor: "#F0CCD9",
    marginVertical: 8,
  },
  totalLabel: { fontSize: 15, fontWeight: "900", color: "#1A1A1A" },
  totalValue: { fontSize: 24, fontWeight: "900", color: "#FF4D94" },

  // BUTTONS
  btnWhatsapp: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#25D366",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnText: { color: "white", fontWeight: "800", fontSize: 15 },

  btnClear: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
    padding: 10,
  },
  btnClearText: { color: "#d32f2f", fontWeight: "700" },
});
