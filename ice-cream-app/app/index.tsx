import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter, Stack } from "expo-router";

// Obtenemos las dimensiones de la pantalla para calcular tamaños proporcionales pero contenidos
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Define la ruta a tu imagen de fondo.
  const imagenDeFondo = require("../assets/images/imagen-principal.png");

  return (
    <View style={styles.container}>
      {/* Configuraciones de pantalla completa */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Imagen de Fondo ocupando todo el espacio */}
      <ImageBackground
        source={imagenDeFondo}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Capa con MUY POCA opacidad (más clara) y centrada */}
        <View style={styles.overlay}>
          {/* Contenedor principal de contenido centrado */}
          <View style={styles.contentContainer}>
            {/* Títulos */}
            <View style={styles.textContainer}>
              <Text
                style={styles.title}
                onLongPress={() => router.push("/admin")}
                suppressHighlighting
              >
                ICECREAM
              </Text>
              <Text style={styles.subtitle}>
                Sabor y frescura en cada bocado
              </Text>
            </View>

            {/* Botón */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => router.replace("/home")}
            >
              <Text style={styles.buttonText}>INGRESAR</Text>
            </TouchableOpacity>

            {/* Ubicación */}
            <Text style={styles.locationText}>Neiva, Huila</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    // REAJUSTE DE OPACIDAD: Capa cian extremadamente sutil para legibilidad del texto blanco, permitiendo que la imagen resalte.
    backgroundColor: "rgba(0, 96, 100, 0.15)", // Muy sutil
    justifyContent: "center", // Centrado vertical de todo el bloque
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: "center",
    // Limita el ancho máximo del contenido para que no "toque los bordes" y se vea contenido.
    width: screenWidth * 0.85,
  },
  textContainer: {
    alignItems: "center",
    // Espaciado contenido antes del botón
    marginBottom: screenHeight * 0.1,
  },
  title: {
    // REAJUSTE DE TAMAÑO: Menos grande.
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 2,
    // Sombra de texto suave para asegurar legibilidad sobre la imagen más clara.
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subtitle: {
    // REAJUSTE DE TAMAÑO: Más pequeño y contenido.
    fontSize: 15,
    color: "#E0F7FA", // Cian muy claro
    fontStyle: "italic",
    marginTop: 8,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: "white",
    // REAJUSTE DE TAMAÑO: Menos grande, bordes más cerrados.
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Espaciado contenido antes de la ubicación
    marginBottom: 20,
  },
  buttonText: {
    color: "#006064",
    // REAJUSTE DE TAMAÑO: Letra más contenida.
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  locationText: {
    color: "white",
    // REAJUSTE DE TAMAÑO: Muy discreto.
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
