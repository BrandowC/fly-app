import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter, Stack } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animaciones de entrada
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;

  // Animación del botón al presionar
  const buttonPressScale = useRef(new Animated.Value(1)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [titleFade, titleTranslate, subtitleFade, buttonFade, buttonScale]);

  const imagenDeFondo = require("../assets/images/imagen-principal.png");

  const handleIngresar = () => {
    // Animación al presionar: escala el botón y hace fade-out de toda la pantalla
    Animated.parallel([
      Animated.sequence([
        Animated.timing(buttonPressScale, {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPressScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 350,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/home");
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={imagenDeFondo}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: titleFade,
                transform: [{ translateY: titleTranslate }],
              },
            ]}
          >
            <Text
              style={styles.title}
              onLongPress={() => router.push("/admin")}
              suppressHighlighting
            >
              ICECREAM
            </Text>
            <Animated.Text
              style={[styles.subtitle, { opacity: subtitleFade }]}
            >
              Sabor y frescura en cada bocado
            </Animated.Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: buttonFade,
              transform: [
                { scale: Animated.multiply(buttonScale, buttonPressScale) },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.9}
              onPress={handleIngresar}
            >
              <Text style={styles.buttonText}>INGRESAR</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: "center",
    width: screenWidth * 0.85,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: screenHeight * 0.1,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "white",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF5F9",
    fontStyle: "italic",
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#D81B60",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});
