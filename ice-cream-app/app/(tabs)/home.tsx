import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  StatusBar,
} from "react-native";

const STATUS_BAR_PADDING = (StatusBar.currentHeight || 44) + 24;
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useRouter } from "expo-router";

type Categoria = "tamano" | "helado" | "topping";

const CATEGORIAS: {
  key: Categoria;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
}[] = [
  {
    key: "tamano",
    label: "Tamaño",
    icon: "beaker",
    color: "#00BCD4",
    bgLight: "#E0F7FA",
  },
  {
    key: "helado",
    label: "Helados",
    icon: "ice-cream",
    color: "#FF4D94",
    bgLight: "#FFE4EE",
  },
  {
    key: "topping",
    label: "Toppings",
    icon: "sparkles",
    color: "#FF9800",
    bgLight: "#FFF3E0",
  },
];

// Paletas de colores para las tarjetas de helados
const HELADO_PALETAS = [
  { bg: "#FFE4EE", accent: "#FF4D94" }, // rosa
  { bg: "#FFF3E0", accent: "#FF9800" }, // naranja
  { bg: "#E0F7FA", accent: "#00BCD4" }, // cyan
  { bg: "#F3E5F5", accent: "#AB47BC" }, // púrpura
  { bg: "#FFF9C4", accent: "#FBC02D" }, // amarillo
  { bg: "#C8E6C9", accent: "#43A047" }, // verde
  { bg: "#FFCCBC", accent: "#E64A19" }, // coral
  { bg: "#D1C4E9", accent: "#5E35B1" }, // lavanda
];

// Mapeo de emojis según el nombre del helado/topping
const getEmoji = (nombre: string): string => {
  const n = nombre.toLowerCase();
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

// Iconos para tamaños (tamaño del icono varía según el vaso)
const TAMANO_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; size: number }
> = {
  Pequeño: { icon: "beaker-outline", size: 26 },
  Mediano: { icon: "beaker", size: 34 },
  Grande: { icon: "beaker", size: 42 },
};

export default function HomeScreen() {
  const router = useRouter();
  const [productos, setProductos] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>("tamano");
  const { addToCart } = useCart();

  // Animación de entrada al cambiar de tab
  const contentFade = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDatos();
  }, []);

  // Animar cuando cambia la categoría
  useEffect(() => {
    contentFade.setValue(0);
    contentTranslate.setValue(20);
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [categoriaActiva, contentFade, contentTranslate]);

  const fetchDatos = async () => {
    try {
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
        "Asegúrate de que el backend esté corriendo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item: any, categoria: string) => {
    addToCart({
      id: `${categoria}-${item.id}`,
      name: item.nombre,
      price: item.price || item.precio || 0,
      quantity: 1,
    });
    Alert.alert("¡Añadido!", `${item.nombre} se agregó a tu Ice Cream.`);
  };

  const categoriaConfig = CATEGORIAS.find((c) => c.key === categoriaActiva)!;

  const tamanos = productos.filter((p) => p.tipo === "TAMAÑO");
  const helados = productos.filter(
    (p) => p.tipo === "CREMA" || p.tipo === "AGUA",
  );

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#FF4D94" />
        <Text style={styles.loadingText}>Preparando delicias...</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: categoriaConfig.bgLight }]}
    >
      {/* Título de bienvenida - tappable, lleva a la pantalla de Welcome */}
      <View style={styles.welcomeSection}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.brandTitle}>Ice Cream 🍦</Text>
        </TouchableOpacity>
        <View style={styles.tagline}>
          <View style={styles.taglineLine} />
          <Text style={styles.taglineText}>Personaliza tu Helado</Text>
          <View style={styles.taglineLine} />
        </View>
      </View>

      {/* BARRA DE TABS */}
      <View style={styles.tabBar}>
        {CATEGORIAS.map((cat) => {
          const isActive = categoriaActiva === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.tab,
                isActive && {
                  backgroundColor: cat.color,
                  shadowColor: cat.color,
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                },
              ]}
              onPress={() => setCategoriaActiva(cat.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={cat.icon}
                size={22}
                color={isActive ? "white" : cat.color}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? "white" : cat.color },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CONTENIDO ANIMADO SEGÚN TAB */}
      <Animated.View
        style={{
          flex: 1,
          opacity: contentFade,
          transform: [{ translateY: contentTranslate }],
        }}
      >
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ========== TAMAÑO ========== */}
          {categoriaActiva === "tamano" && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionHeader, { color: categoriaConfig.color }]}
              >
                Elige tu tamaño
              </Text>
              <Text style={styles.sectionSubtext}>
                Selecciona cómo lo quieres
              </Text>
              <View style={styles.tamanoGrid}>
                {tamanos.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No hay tamaños disponibles.
                  </Text>
                ) : (
                  tamanos.map((t) => {
                    const cfg = TAMANO_CONFIG[t.nombre] || {
                      icon: "beaker" as const,
                      size: 34,
                    };
                    return (
                      <TouchableOpacity
                        key={`tamano-${t.id}`}
                        style={styles.tamanoCardSmall}
                        onPress={() => handleAdd(t, "tamano")}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.tamanoIconSmall,
                            { backgroundColor: categoriaConfig.color },
                          ]}
                        >
                          <Ionicons
                            name={cfg.icon}
                            size={cfg.size}
                            color="white"
                          />
                        </View>
                        <Text
                          style={[
                            styles.tamanoNameSmall,
                            { color: categoriaConfig.color },
                          ]}
                        >
                          {t.nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          )}

          {/* ========== HELADOS ========== */}
          {categoriaActiva === "helado" && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionHeader, { color: categoriaConfig.color }]}
              >
                Elige tu sabor
              </Text>
              <Text style={styles.sectionSubtext}>
                Sabores deliciosos listos para ti 🍦
              </Text>
              <View style={styles.grid}>
                {helados.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No hay helados disponibles.
                  </Text>
                ) : (
                  helados.map((prod, idx) => {
                    const paleta = HELADO_PALETAS[idx % HELADO_PALETAS.length];
                    return (
                      <TouchableOpacity
                        key={`prod-${prod.id}`}
                        style={[styles.iceCard, { backgroundColor: paleta.bg }]}
                        onPress={() => handleAdd(prod, "helado")}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.emojiCircle,
                            { backgroundColor: "white" },
                          ]}
                        >
                          <Text style={styles.emojiBig}>
                            {getEmoji(prod.nombre)}
                          </Text>
                        </View>
                        <Text style={[styles.iceName, { color: paleta.accent }]}>
                          {prod.nombre}
                        </Text>
                        <Text style={styles.iceTipo}>{prod.tipo}</Text>
                        <View
                          style={[
                            styles.pricePill,
                            { backgroundColor: paleta.accent },
                          ]}
                        >
                          <Text style={styles.icePrice}>${prod.precio}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          )}

          {/* ========== TOPPINGS ========== */}
          {categoriaActiva === "topping" && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionHeader, { color: categoriaConfig.color }]}
              >
                Endulza tu helado
              </Text>
              <Text style={styles.sectionSubtext}>
                Añade los toppings que más te gusten ✨
              </Text>
              <View style={styles.grid}>
                {toppings.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No hay toppings disponibles.
                  </Text>
                ) : (
                  toppings.map((top, idx) => {
                    const paleta = HELADO_PALETAS[idx % HELADO_PALETAS.length];
                    return (
                      <TouchableOpacity
                        key={`top-${top.id}`}
                        style={[styles.topCard, { backgroundColor: paleta.bg }]}
                        onPress={() => handleAdd(top, "topping")}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.emojiCircle,
                            { backgroundColor: "white" },
                          ]}
                        >
                          <Text style={styles.emojiBig}>
                            {getEmoji(top.nombre)}
                          </Text>
                        </View>
                        <Text style={[styles.topName, { color: paleta.accent }]}>
                          {top.nombre}
                        </Text>
                        {top.descripcion && (
                          <Text style={styles.topDesc} numberOfLines={1}>
                            {top.descripcion}
                          </Text>
                        )}
                        <View
                          style={[
                            styles.pricePill,
                            { backgroundColor: paleta.accent },
                          ]}
                        >
                          <Text style={styles.icePrice}>${top.precio}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUS_BAR_PADDING,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFE4EE",
  },
  loadingText: {
    marginTop: 12,
    color: "#FF4D94",
    fontWeight: "600",
    fontSize: 15,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 22,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: -0.5,
    marginBottom: 14,
    textAlign: "center",
  },
  tagline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taglineLine: {
    width: 28,
    height: 2,
    backgroundColor: "#FF4D94",
    borderRadius: 1,
  },
  taglineText: {
    fontSize: 15,
    color: "#FF4D94",
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // TABS
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 6,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 50,
    gap: 6,
  },
  tabText: {
    fontWeight: "700",
    fontSize: 14,
  },

  // CONTENT
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    marginLeft: 4,
  },
  sectionSubtext: {
    fontSize: 13,
    color: "#777",
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 40,
    width: "100%",
  },

  // TAMAÑO - tarjetas pequeñas en fila
  tamanoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  tamanoCardSmall: {
    flex: 1,
    backgroundColor: "white",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tamanoIconSmall: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tamanoNameSmall: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  // HELADOS / TOPPINGS GRID
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iceCard: {
    width: "48%",
    padding: 14,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emojiCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emojiBig: {
    fontSize: 40,
  },
  iceName: {
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
  },
  iceTipo: {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
    fontWeight: "600",
  },
  pricePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  icePrice: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },

  // TOPPING CARD
  topCard: {
    width: "48%",
    padding: 14,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  topName: {
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 2,
  },
  topDesc: {
    color: "#888",
    fontSize: 11,
    marginBottom: 10,
    fontWeight: "500",
    textAlign: "center",
  },
});
