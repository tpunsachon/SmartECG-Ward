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

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setLoading(true);

    // สมัครสมาชิกผ่าน Supabase Auth (รหัสผ่านจะถูก Hash เก็บในระบบความปลอดภัย)
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          name: name, // ส่งชื่อไปเพื่อให้ Trigger ใน สเต็ปที่ 1 ดึงไปใส่ profiles
          role: "user",
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("ลงทะเบียนไม่สำเร็จ", error.message);
      return;
    }

    Alert.alert("สำเร็จ", "ลงทะเบียนเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ", [
      { text: "ตกลง", onPress: () => router.replace("/login") },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={S.container}>
      <View style={S.card}>
        <Text style={S.title}>ลงทะเบียนเข้าใช้งาน</Text>
        <Text style={S.subtitle}>SmartECG-Ward System</Text>

        <View style={{ gap: 12, marginVertical: 20 }}>
          <View>
            <Text style={S.label}>ชื่อ-นามสกุล (NAME)</Text>
            <TextInput
              style={S.input}
              placeholder="กรอกชื่อ-นามสกุล"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

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
              placeholder="กรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[S.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={S.btnPrimaryText}>
            {loading ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียน"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={S.btnBack}
          onPress={() => router.replace("/login")}
        >
          <Text style={S.btnBackText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
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
    backgroundColor: "#0284c7",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  btnBack: { padding: 12, alignItems: "center", marginTop: 10 },
  btnBackText: { color: "#64748b", fontWeight: "bold", fontSize: 13 },
});