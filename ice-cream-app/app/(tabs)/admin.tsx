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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

export default function AdminScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [pedidos, setPedidos] = useState([]);

  // 1. Función para Login real con el Backend
  const handleLogin = async () => {
    if (!user || !password) {
      Alert.alert("Campos vacíos", "Escribe tus credenciales");
      return;
    }
    setLoading(true);
    try {
      // Ajusta '/auth/login' según tu controlador de NestJS
      const response = await api.post("/auth/login", {
        username: user,
        password,
      });

      // Si tu backend devuelve un token o un success
      if (response.data) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      Alert.alert("Error de acceso", "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  // 2. Función para traer pedidos de la DB
  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const response = await api.get("/pedidos"); // Tu ruta GET en NestJS
      setPedidos(response.data);
    } catch (error) {
      console.log("Error trayendo pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos automáticamente al loguearse
  useEffect(() => {
    if (isLoggedIn) {
      fetchPedidos();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <Ionicons name="shield-checkmark" size={80} color="#00838f" />
        <Text style={styles.loginTitle}>Acceso Administrativo</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          onChangeText={setUser}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.btnLogin}
          onPress={handleLogin}
          disabled={loading}
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
      <View style={styles.adminHeader}>
        <Text style={styles.adminTitle}>Pedidos en Base de Datos</Text>
        <TouchableOpacity onPress={fetchPedidos}>
          <Ionicons name="refresh" size={24} color="#00838f" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pedidoCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clienteText}>
                {item.cliente || "Anónimo"}
              </Text>
              <Text style={styles.detallesText}>
                {item.descripcion || "Sin descripción"}
              </Text>
            </View>
            <Text style={styles.precioText}>${item.total}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay peticiones registradas aún.
          </Text>
        }
        contentContainerStyle={{ padding: 20 }}
      />

      <TouchableOpacity
        style={styles.btnLogout}
        onPress={() => setIsLoggedIn(false)}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    padding: 30,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#006064",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "white",
    width: "100%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#b2ebf2",
  },
  btnLogin: {
    backgroundColor: "#00838f",
    width: "100%",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  btnText: { color: "white", fontWeight: "bold" },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  adminHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  adminTitle: { fontSize: 18, fontWeight: "bold", color: "#006064" },
  pedidoCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  clienteText: { fontWeight: "bold", fontSize: 16 },
  detallesText: { color: "#666", fontSize: 13 },
  precioText: { fontWeight: "bold", color: "#00838f", fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#999" },
  btnLogout: {
    margin: 20,
    padding: 15,
    backgroundColor: "#ffcdd2",
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "#c62828", fontWeight: "bold" },
});
