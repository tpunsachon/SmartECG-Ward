import { Session } from "@supabase/supabase-js";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentRoute = segments[0] || "";

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup =
      currentRoute === "login" ||
      currentRoute === "register" ||
      currentRoute === "" ||
      currentRoute === "index";

    if (!session && !inAuthGroup) {
      if (currentRoute !== "login") {
        router.replace("/login");
      }
    } else if (session && inAuthGroup) {
      if (currentRoute !== "overview") {
        router.replace("/overview");
      }
    }
  }, [session, initialized, currentRoute]);

  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  const hideTabBar =
    currentRoute === "login" ||
    currentRoute === "register" ||
    currentRoute === "" ||
    currentRoute === "index";

  return (
    <Tabs
      screenOptions={{
        headerShown: true, // เปิดการแสดง Header แถบด้านบน
        headerStyle: {
          backgroundColor: "#97c4db", // ตั้งค่า Header สีฟ้า
        },
        headerTintColor: "#ffffff", // ตัวหนังสือและไอคอนบน Header สีขาว
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        tabBarStyle: hideTabBar
          ? { display: "none" }
          : { height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarActiveTintColor: "#0284c7", // สีปุ่มเมื่อกดเลือก
        tabBarInactiveTintColor: "#64748b", // สีปุ่มปกติ
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      {/* 1. Overview Tab */}
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          headerTitle: "🏥 Overview Dashboard",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 18 }}>🏥</Text>
          ),
        }}
      />

      {/* 2. Live Monitor Tab */}
      <Tabs.Screen
        name="live"
        options={{
          title: "Live Monitor",
          headerTitle: "⚡ Real-time ECG Monitoring",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 18 }}>⚡</Text>
          ),
        }}
      />

      {/* 3. Summary Tab */}
      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          headerTitle: "📊 Summary & Analytics",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 18 }}>📊</Text>
          ),
        }}
      />

      {/* ซ่อน Route อื่นๆ ไม่ให้แสดงบน Bottom Tab Bar และ Header */}
      <Tabs.Screen name="index" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="login" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="register" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="add-patient" options={{ href: null }} />
      <Tabs.Screen name="patient-live" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});