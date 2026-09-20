import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);

    // ตรวจสอบการเข้าสู่ระบบด้วย Supabase Authentication
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    // เมื่อ Login สำเร็จ ให้พาเข้าหน้า Overview
    router.replace("/overview");
  };

  return (
    <ScrollView contentContainerStyle={S.container}>
      <View style={S.card}>
        <View style={{ marginBottom: 20 }}>
          <Text style={S.title}>เข้าสู่ระบบ</Text>
          <Text style={S.subtitle}>SmartECG-Ward System</Text>
        </View>

        <View style={{ gap: 12, marginBottom: 20 }}>
          <View>
            <Text style={S.label}>อีเมล (EMAIL)</Text>
            <TextInput
              style={S.input}
              placeholder="example@hospital.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text style={S.label}>รหัสผ่าน (PASSWORD)</Text>
            <TextInput
              style={S.input}
              placeholder="กรอกรหัสผ่าน"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[S.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={S.btnPrimaryText}>
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={S.btnBack}
          onPress={() => router.push("/register")}
        >
          <Text style={S.btnBackText}>ยังไม่มีบัญชี?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: "#0f172a",
  },
  btnPrimary: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaryText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  btnBack: { padding: 12, alignItems: "center", marginTop: 10 },
  btnBackText: { color: "#64748b", fontWeight: "bold", fontSize: 13 },
});
