import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function HomeScreen() {
  const [productos, setProductos] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      // Peticiones a tu backend de NestJS con la IP 192.168.1.35
      const [prodRes, topRes] = await Promise.all([
        api.get("/productos"),
        api.get("/toppings"),
      ]);
      setProductos(prodRes.data);
      setToppings(topRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Alert.alert(
        "Error de Conexión",
        "Asegúrate de que el backend en la IP 192.168.1.35 esté corriendo y tengas datos en la DB.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item: any, categoria: string) => {
    addToCart({
      id: `${categoria}-${item.id}`,
      name: item.nombre,
      price: item.price || item.precio, // Por si cambia el nombre del campo
      quantity: 1,
    });
    Alert.alert("Añadido", `${item.nombre} se agregó a tu Ice Cream.`);
  };

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#00838f" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Título Personalizado */}
      <Text style={styles.brandTitle}>Ice Cream 🍦</Text>
      <Text style={styles.subTitle}>Personaliza tu helado</Text>

      {/* SECCIÓN 1: LOS VASOS */}
      <Text style={styles.sectionHeader}>1. Elige tu Vaso</Text>
      <View style={styles.horizontalContainer}>
        <TouchableOpacity
          style={styles.vasoCard}
          onPress={() =>
            handleAdd({ id: 1, nombre: "Vaso Pequeño", precio: 5000 }, "vaso")
          }
        >
          <Ionicons name="beaker-outline" size={30} color="#00838f" />
          <Text style={styles.itemLabel}>Pequeño</Text>
          <Text style={styles.priceLabel}>$5.000</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.vasoCard}
          onPress={() =>
            handleAdd({ id: 2, nombre: "Vaso Grande", precio: 8000 }, "vaso")
          }
        >
          <Ionicons name="beaker" size={30} color="#00838f" />
          <Text style={styles.itemLabel}>Grande</Text>
          <Text style={styles.priceLabel}>$8.000</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN 2: LOS HELADOS (SABORES) - ACTUALIZADO CON TIPO */}
      <Text style={styles.sectionHeader}>2. Sabores de Helado</Text>
      <View style={styles.grid}>
        {productos.map((prod: any) => (
          <TouchableOpacity
            key={`prod-${prod.id}`}
            style={styles.iceCard}
            onPress={() => handleAdd(prod, "helado")}
          >
            <Ionicons name="ice-cream-outline" size={24} color="white" />
            <Text style={styles.iceName}>{prod.nombre}</Text>
            {/* Mostramos el tipo (Crema/Agua) que vimos en tu DB */}
            <Text style={{ color: "#E0F7FA", fontSize: 11, marginBottom: 5 }}>
              {prod.tipo}
            </Text>
            <Text style={styles.icePrice}>${prod.precio}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SECCIÓN 3: TOPPINGS - ACTUALIZADO CON DISEÑO CHIP */}
      <Text style={styles.sectionHeader}>3. Tus Toppings Favoritos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.topScroll}
      >
        {toppings.map((top: any) => (
          <TouchableOpacity
            key={`top-${top.id}`}
            style={styles.topChip}
            onPress={() => handleAdd(top, "topping")}
          >
            <Text style={styles.topText}>
              {top.nombre} - ${top.precio}
            </Text>
            <Ionicons name="add-circle" size={18} color="#00838f" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0F7FA", padding: 20 },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0F7FA",
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#006064",
    textAlign: "center",
    marginTop: 10,
  },
  subTitle: {
    fontSize: 18,
    color: "#00838f",
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#004d40",
    marginBottom: 15,
    marginTop: 10,
  },
  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  vasoCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    width: "45%",
    elevation: 3,
  },
  itemLabel: { fontWeight: "bold", marginTop: 5 },
  priceLabel: { color: "#00838f" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iceCard: {
    backgroundColor: "#0097A7",
    width: "48%",
    padding: 15, // Ajustado para que quepa el texto del tipo
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
  },
  iceName: { color: "white", fontWeight: "bold", marginTop: 8, fontSize: 15 },
  icePrice: { color: "white", fontWeight: "bold", fontSize: 14 },
  topScroll: { marginBottom: 20 },
  topChip: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#b2ebf2",
  },
  topText: { marginRight: 8, fontWeight: "500", color: "#333" },
});
