import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import api from "../services/api";

type AdminTab = "helados" | "toppings" | "pedidos";

type Producto = {
  id: number;
  nombre: string;
  tipo: string;
  precio: string | number;
  disponible: boolean;
};

type Topping = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  disponible: boolean;
};

type PedidoDetalle = {
  id: number;
  cantidad: number;
  subtotal: string | number;
  producto?: { id: number; nombre: string; tipo: string; precio: string | number };
  topping?: { id: number; nombre: string; precio: string | number } | null;
};

type Pedido = {
  id: number;
  clienteNombre: string;
  telefono: string;
  direccion: string;
  total: string | number;
  completado: boolean;
  createdAt?: string;
  detalles?: PedidoDetalle[];
};

// Formatear fecha del pedido
const formatDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const dia = d.getDate().toString().padStart(2, "0");
  const mes = (d.getMonth() + 1).toString().padStart(2, "0");
  const año = d.getFullYear();
  const hora = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${dia}/${mes}/${año} · ${hora}:${min}`;
};

export default function AdminScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const [activeTab, setActiveTab] = useState<AdminTab>("helados");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // ========== LOGIN ==========
  const handleLogin = async () => {
    if (!user || !password) {
      Alert.alert("Campos vacíos", "Escribe tus credenciales");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        username: user,
        password,
      });
      if (response.data?.success) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      Alert.alert("Error de acceso", "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  // ========== FETCH DATA ==========
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, topRes, pedRes] = await Promise.all([
        api.get("/productos"),
        api.get("/toppings"),
        api.get("/pedidos"),
      ]);
      setProductos(prodRes.data);
      setToppings(topRes.data);
      setPedidos(pedRes.data);
    } catch (error) {
      console.log("Error cargando datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAll();
    }
  }, [isLoggedIn]);

  // ========== CRUD HELADOS ==========
  const openHeladoForm = (producto?: Producto) => {
    setEditingItem(producto || null);
    setFormData(
      producto
        ? {
            nombre: producto.nombre,
            tipo: producto.tipo,
            precio: String(producto.precio),
            disponible: producto.disponible,
          }
        : { nombre: "", tipo: "CREMA", precio: "", disponible: true },
    );
    setModalVisible(true);
  };

  const saveHelado = async () => {
    const nombre = String(formData.nombre || "").trim();
    const tipo = String(formData.tipo || "CREMA").trim();
    const precioNum = Number(formData.precio);

    if (!nombre) {
      Alert.alert("Faltan datos", "El nombre es obligatorio");
      return;
    }
    if (!tipo) {
      Alert.alert("Faltan datos", "Selecciona un tipo (CREMA, AGUA o TAMAÑO)");
      return;
    }
    if (isNaN(precioNum) || precioNum < 0) {
      Alert.alert("Precio inválido", "El precio debe ser un número mayor o igual a 0");
      return;
    }

    try {
      const payload = {
        nombre,
        tipo,
        precio: precioNum,
        disponible: formData.disponible !== false,
      };

      if (editingItem) {
        await api.patch(`/productos/${editingItem.id}`, payload);
      } else {
        await api.post("/productos", payload);
      }

      setModalVisible(false);
      fetchAll();
      Alert.alert("Éxito", editingItem ? "Producto actualizado" : "Producto creado");
    } catch (error: any) {
      console.log("Error guardando helado:", error?.response?.data);
      const msg = error?.response?.data?.message;
      const mensaje = Array.isArray(msg) ? msg.join("\n") : msg || "No se pudo guardar";
      Alert.alert("Error al guardar", String(mensaje));
    }
  };

  const deleteHelado = (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar este helado?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/productos/${id}`);
            fetchAll();
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  // ========== CRUD TOPPINGS ==========
  const openToppingForm = (topping?: Topping) => {
    setEditingItem(topping || null);
    setFormData(
      topping
        ? {
            nombre: topping.nombre,
            descripcion: topping.descripcion || "",
            precio: String(topping.precio),
            disponible: topping.disponible,
          }
        : { nombre: "", descripcion: "", precio: "", disponible: true },
    );
    setModalVisible(true);
  };

  const saveTopping = async () => {
    const nombre = String(formData.nombre || "").trim();
    const precioNum = Number(formData.precio);
    const descripcion = String(formData.descripcion || "").trim();

    if (!nombre) {
      Alert.alert("Faltan datos", "El nombre es obligatorio");
      return;
    }
    if (isNaN(precioNum) || precioNum < 0) {
      Alert.alert("Precio inválido", "El precio debe ser un número mayor o igual a 0");
      return;
    }

    try {
      const payload: any = {
        nombre,
        precio: precioNum,
        disponible: formData.disponible !== false,
      };
      if (descripcion) payload.descripcion = descripcion;

      if (editingItem) {
        await api.patch(`/toppings/${editingItem.id}`, payload);
      } else {
        await api.post("/toppings", payload);
      }

      setModalVisible(false);
      fetchAll();
      Alert.alert("Éxito", editingItem ? "Topping actualizado" : "Topping creado");
    } catch (error: any) {
      console.log("Error guardando topping:", error?.response?.data);
      const msg = error?.response?.data?.message;
      const mensaje = Array.isArray(msg) ? msg.join("\n") : msg || "No se pudo guardar";
      Alert.alert("Error al guardar", String(mensaje));
    }
  };

  // ========== TOGGLE PEDIDO ==========
  const togglePedido = async (id: number, currentState: boolean) => {
    const accion = currentState ? "marcar como pendiente" : "marcar como entregado";
    Alert.alert("Confirmar", `¿Deseas ${accion} este pedido?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí",
        onPress: async () => {
          try {
            await api.patch(`/pedidos/${id}/toggle`);
            fetchAll();
          } catch (error) {
            Alert.alert("Error", "No se pudo actualizar el pedido");
          }
        },
      },
    ]);
  };

  const deleteTopping = (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar este topping?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/toppings/${id}`);
            fetchAll();
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  // ========== UI ==========
  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#006064" />
        </TouchableOpacity>

        <View style={styles.shieldCircle}>
          <Ionicons name="shield-checkmark" size={60} color="white" />
        </View>
        <Text style={styles.loginTitle}>Acceso Administrativo</Text>
        <Text style={styles.loginSubtitle}>Solo personal autorizado</Text>

        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={20} color="#00838f" />
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor="#999"
            onChangeText={setUser}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color="#00838f" />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.btnLogin}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Ingresar al Sistema</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.adminHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.adminTitle}>Panel Admin</Text>
        <TouchableOpacity onPress={fetchAll}>
          <Ionicons name="refresh" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabBar}>
        {[
          { key: "helados", label: "Helados", icon: "ice-cream" as const },
          { key: "toppings", label: "Toppings", icon: "sparkles" as const },
          { key: "pedidos", label: "Pedidos", icon: "receipt" as const },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key as AdminTab)}
          >
            <Ionicons
              name={t.icon}
              size={18}
              color={activeTab === t.key ? "white" : "#00838f"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTÓN AGREGAR (Helados / Toppings) */}
      {(activeTab === "helados" || activeTab === "toppings") && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            activeTab === "helados" ? openHeladoForm() : openToppingForm()
          }
        >
          <Ionicons name="add-circle" size={22} color="white" />
          <Text style={styles.addBtnText}>
            Agregar {activeTab === "helados" ? "Helado" : "Topping"}
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#00838f"
          style={{ marginTop: 20 }}
        />
      )}

      {/* CONTENIDO */}
      {!loading && activeTab === "helados" && (
        <FlatList
          data={productos}
          keyExtractor={(item) => `p-${item.id}`}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View
                style={[
                  styles.cardIcon,
                  { backgroundColor: item.tipo === "TAMAÑO" ? "#E0F7FA" : "#FFE4EE" },
                ]}
              >
                <Ionicons
                  name={item.tipo === "TAMAÑO" ? "beaker" : "ice-cream"}
                  size={22}
                  color={item.tipo === "TAMAÑO" ? "#00BCD4" : "#FF4D94"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.tipo} · ${item.precio}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => openHeladoForm(item)}
                style={styles.actionBtn}
              >
                <Ionicons name="create" size={20} color="#00838f" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteHelado(item.id)}
                style={styles.actionBtn}
              >
                <Ionicons name="trash" size={20} color="#c62828" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay helados registrados.</Text>
          }
        />
      )}

      {!loading && activeTab === "toppings" && (
        <FlatList
          data={toppings}
          keyExtractor={(item) => `t-${item.id}`}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="sparkles" size={22} color="#FF9800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.descripcion || "Sin descripción"} · ${item.precio}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => openToppingForm(item)}
                style={styles.actionBtn}
              >
                <Ionicons name="create" size={20} color="#00838f" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTopping(item.id)}
                style={styles.actionBtn}
              >
                <Ionicons name="trash" size={20} color="#c62828" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay toppings registrados.</Text>
          }
        />
      )}

      {!loading && activeTab === "pedidos" && (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => `o-${item.id}`}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.pedidoCard}>
              {/* HEADER - Número de pedido y estado */}
              <View style={styles.pedidoTopBar}>
                <View style={styles.pedidoNumBox}>
                  <Ionicons name="receipt" size={18} color="white" />
                  <Text style={styles.pedidoNumText}>Pedido #{item.id}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: item.completado ? "#C8E6C9" : "#FFE0B2",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.completado ? "checkmark-circle" : "time"}
                    size={14}
                    color={item.completado ? "#2E7D32" : "#E65100"}
                  />
                  <Text
                    style={[
                      styles.badgeText,
                      { color: item.completado ? "#2E7D32" : "#E65100" },
                    ]}
                  >
                    {item.completado ? "Entregado" : "Pendiente"}
                  </Text>
                </View>
              </View>

              {/* Fecha del pedido */}
              <View style={styles.pedidoDateRow}>
                <Ionicons name="calendar" size={13} color="#888" />
                <Text style={styles.pedidoDate}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>

              {/* DATOS DEL CLIENTE */}
              <View style={styles.clienteBox}>
                <View style={styles.clienteRow}>
                  <Ionicons name="person" size={14} color="#00838f" />
                  <Text style={styles.clienteText}>{item.clienteNombre}</Text>
                </View>
                <View style={styles.clienteRow}>
                  <Ionicons name="call" size={14} color="#00838f" />
                  <Text style={styles.clienteText}>{item.telefono}</Text>
                </View>
                <View style={styles.clienteRow}>
                  <Ionicons name="location" size={14} color="#00838f" />
                  <Text style={styles.clienteText}>{item.direccion}</Text>
                </View>
              </View>

              {/* DETALLE DE PRODUCTOS */}
              {item.detalles && item.detalles.length > 0 && (
                <View style={styles.detallesBox}>
                  <Text style={styles.detallesHeader}>
                    🛒 Productos pedidos
                  </Text>
                  {item.detalles.map((d) => (
                    <View key={`d-${d.id}`} style={styles.detalleRow}>
                      <View style={styles.detalleBullet} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detalleName}>
                          {d.cantidad}x {d.producto?.nombre || "Producto"}
                          {d.topping ? ` + ${d.topping.nombre}` : ""}
                        </Text>
                        {d.producto?.tipo && (
                          <Text style={styles.detalleTipo}>
                            {d.producto.tipo}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.detalleSub}>${d.subtotal}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* TOTAL */}
              <View style={styles.pedidoFoot}>
                <Text style={styles.pedidoFootLabel}>TOTAL</Text>
                <Text style={styles.pedidoTotal}>${item.total}</Text>
              </View>

              {/* BOTÓN TOGGLE ESTADO */}
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: item.completado ? "#FFE0B2" : "#C8E6C9",
                  },
                ]}
                onPress={() => togglePedido(item.id, item.completado)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.completado ? "refresh-circle" : "checkmark-done-circle"}
                  size={22}
                  color={item.completado ? "#E65100" : "#2E7D32"}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: item.completado ? "#E65100" : "#2E7D32" },
                  ]}
                >
                  {item.completado
                    ? "Marcar como pendiente"
                    : "Marcar como entregado"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay pedidos registrados.</Text>
          }
        />
      )}

      {/* BOTÓN CERRAR SESIÓN */}
      <TouchableOpacity
        style={styles.btnLogout}
        onPress={() => setIsLoggedIn(false)}
      >
        <Ionicons name="log-out-outline" size={20} color="#c62828" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* MODAL FORMULARIO */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? "Editar" : "Crear"}{" "}
                  {activeTab === "helados" ? "Helado" : "Topping"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={26} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.nombre}
                onChangeText={(v) => setFormData({ ...formData, nombre: v })}
                placeholder="Ej: Helado de Fresa"
              />

              {activeTab === "helados" && (
                <>
                  <Text style={styles.label}>Tipo *</Text>
                  <View style={styles.radioRow}>
                    {["CREMA", "AGUA", "TAMAÑO"].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.radioBtn,
                          formData.tipo === t && styles.radioBtnActive,
                        ]}
                        onPress={() => setFormData({ ...formData, tipo: t })}
                      >
                        <Text
                          style={[
                            styles.radioText,
                            formData.tipo === t && styles.radioTextActive,
                          ]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {activeTab === "toppings" && (
                <>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.descripcion}
                    onChangeText={(v) =>
                      setFormData({ ...formData, descripcion: v })
                    }
                    placeholder="Ej: Salsa dulce"
                  />
                </>
              )}

              <Text style={styles.label}>Precio *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.precio}
                onChangeText={(v) => setFormData({ ...formData, precio: v })}
                placeholder="Ej: 5000"
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() =>
                  setFormData({
                    ...formData,
                    disponible: !formData.disponible,
                  })
                }
              >
                <Ionicons
                  name={formData.disponible ? "checkbox" : "square-outline"}
                  size={24}
                  color="#00838f"
                />
                <Text style={styles.toggleText}>Disponible</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={
                  activeTab === "helados" ? saveHelado : saveTopping
                }
              >
                <Text style={styles.btnText}>
                  {editingItem ? "Actualizar" : "Crear"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // LOGIN
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    padding: 30,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: "white",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  shieldCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#00838f",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 8,
  },
  loginTitle: { fontSize: 24, fontWeight: "800", color: "#006064", marginBottom: 4 },
  loginSubtitle: { fontSize: 14, color: "#00838f", marginBottom: 30 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    width: "100%",
    paddingHorizontal: 15,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#b2ebf2",
    gap: 10,
  },
  input: { flex: 1, paddingVertical: 15, color: "#333", fontSize: 15 },
  btnLogin: {
    backgroundColor: "#00838f",
    width: "100%",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },
  btnText: { color: "white", fontWeight: "800", fontSize: 15 },

  // CONTAINER
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  adminHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    backgroundColor: "#00838f",
  },
  adminTitle: { fontSize: 20, fontWeight: "800", color: "white" },

  // TABS
  tabBar: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 5,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 50,
    gap: 5,
  },
  tabActive: { backgroundColor: "#00838f" },
  tabText: { fontWeight: "700", color: "#00838f", fontSize: 13 },
  tabTextActive: { color: "white" },

  // ADD BUTTON
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00838f",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    elevation: 3,
  },
  addBtnText: { color: "white", fontWeight: "700", fontSize: 14 },

  // CARDS
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 10,
    elevation: 2,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0f7fa",
  },
  cardTitle: { fontWeight: "700", fontSize: 15, color: "#1a1a1a" },
  cardSubtitle: { color: "#666", fontSize: 12, marginTop: 2 },
  actionBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },

  // PEDIDO CARD
  pedidoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pedidoTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pedidoNumBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#00838f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pedidoNumText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "800" },

  pedidoDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 12,
  },
  pedidoDate: { color: "#888", fontSize: 12, fontWeight: "600" },

  clienteBox: {
    backgroundColor: "#F5FCFD",
    padding: 12,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#00838f",
  },
  clienteRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  clienteText: { fontSize: 13, color: "#333", fontWeight: "600", flex: 1 },

  detallesBox: {
    backgroundColor: "#FFF8FB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF4D94",
  },
  detallesHeader: {
    fontWeight: "800",
    fontSize: 13,
    color: "#FF4D94",
    marginBottom: 10,
  },
  detalleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  detalleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF4D94",
  },
  detalleName: { fontSize: 13, color: "#1a1a1a", fontWeight: "600" },
  detalleTipo: { fontSize: 10, color: "#888", fontWeight: "600", marginTop: 1 },
  detalleSub: { fontSize: 13, color: "#00838f", fontWeight: "800" },

  pedidoFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  pedidoFootLabel: {
    color: "#666",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
  },
  pedidoTotal: { fontWeight: "900", fontSize: 20, color: "#00838f" },

  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  toggleBtnText: { fontWeight: "800", fontSize: 13 },

  emptyText: { textAlign: "center", color: "#999", marginTop: 50 },

  btnLogout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    padding: 14,
    backgroundColor: "#ffcdd2",
    borderRadius: 12,
  },
  logoutText: { color: "#c62828", fontWeight: "700" },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#006064" },
  label: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  radioRow: { flexDirection: "row", gap: 8 },
  radioBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  radioBtnActive: { backgroundColor: "#00838f", borderColor: "#00838f" },
  radioText: { fontWeight: "700", color: "#666" },
  radioTextActive: { color: "white" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleText: { fontWeight: "600", color: "#333" },
  saveBtn: {
    backgroundColor: "#00838f",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
});
