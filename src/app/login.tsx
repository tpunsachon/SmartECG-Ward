import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase"; // ปรับ path ตามโครงสร้างโปรเจกต์ของคุณ

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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("เข้าสู่ระบบไม่สำเร็จ", error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.replace("/overview");
      }
    } catch (err: any) {
      Alert.alert("เกิดข้อผิดพลาด", err.message || "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={S.container}
    >
      <ScrollView
        contentContainerStyle={S.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={S.card}>
          {/* Header Icon & Title */}
          <View style={S.headerContainer}>
            <View style={S.iconBadge}>
              <Text style={{ fontSize: 28 }}>🏥</Text>
            </View>
            <Text style={S.title}>เข้าสู่ระบบ</Text>
            <Text style={S.subtitle}>SmartECG-Ward Monitoring System</Text>
          </View>

          {/* Form Inputs */}
          <View style={{ gap: 16, marginVertical: 20 }}>
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

          {/* Login Button */}
          <TouchableOpacity
            style={[S.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={S.btnPrimaryText}>เข้าสู่ระบบ</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            style={S.btnRegister}
            onPress={() => router.push("/register")}
          >
            <Text style={S.btnRegisterText}>
              ยังไม่มีบัญชี? <Text style={S.btnRegisterHighlight}>สมัครสมาชิก</Text>
            </Text>
          </TouchableOpacity>

          {/* ⚠️ Disclaimer Box */}
          <View style={S.disclaimerBox}>
            <Text style={S.disclaimerTitle}>⚠️ ข้อตกลงและคำชี้แจงสิทธิ์ (Disclaimer)</Text>
            <Text style={S.disclaimerText}>
              แอปพลิเคชันนี้เป็นเพียงระบบต้นแบบ (Prototype) เพื่อการศึกษาและการวิจัยเท่านั้น 
              ไม่ได้เป็นอุปกรณ์หรือเครื่องมือทางการแพทย์สำหรับใช้ในการวินิจฉัย ประเมิน หรือรักษาโรคจริง 
              ห้ามนำข้อมูลในระบบไปใช้ทดแทนการตัดสินใจหรือการรักษาพยาบาลโดยแพทย์เด็ดขาด
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff", // 🎨 สีพื้นหลังสีฟ้าอ่อนนุ่มนวล
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bae6fd", // 🎨 เส้นขอบโทนสีฟ้า
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  iconBadge: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0369a1", // 🎨 สีข้อความหัวข้อโทนฟ้าเข้ม
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  btnPrimary: {
    backgroundColor: "#0284c7", // 🎨 สีปุ่มปุ่มเข้าสู่ระบบ (สีฟ้า Medical/ECG)
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnPrimaryText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  btnRegister: {
    padding: 12,
    alignItems: "center",
    marginTop: 4,
  },
  btnRegisterText: {
    color: "#64748b",
    fontSize: 13,
  },
  btnRegisterHighlight: {
    color: "#0284c7",
    fontWeight: "bold",
  },

  /* Disclaimer Box Style */
  disclaimerBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#fffbe2", // 🎨 พื้นหลังสีเหลือง/ส้มอ่อนเตือนความคุ้มครอง
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fef08a",
  },
  disclaimerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#854d0e",
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 10,
    color: "#a16207",
    lineHeight: 15,
  },
});