import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!fullname || !email || !username || !password || !confirmPassword) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านและยืนยันรหัสผ่านอีกครั้ง');
      return;
    }

    Alert.alert(
      'สมัครสมาชิกสำเร็จ! 🎉',
      `ยินดีต้อนรับคุณ ${fullname}\nระบบได้ทำการลงทะเบียนบัญชีของคุณเรียบร้อยแล้ว`,
      [
        {
          text: 'เข้าใช้งานระบบ',
          onPress: () => router.replace('/overview'),
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={S.container}>
      <View style={S.card}>
        <View style={{ marginBottom: 20 }}>
          <Text style={S.title}>📝 ลงทะเบียนใช้งาน</Text>
          <Text style={S.subtitle}>สร้างบัญชีสำหรับบุคลากรทางการแพทย์</Text>
        </View>

        <View style={{ gap: 12, marginBottom: 20 }}>
          <View>
            <Text style={S.label}>ชื่อ - นามสกุล (พร้อมคำนำหน้า)</Text>
            <TextInput
              style={S.input}
              placeholder="เช่น นพ.สมชาย ใจดี"
              placeholderTextColor="#94a3b8"
              value={fullname}
              onChangeText={setFullname}
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
            <Text style={S.label}>USERNAME</Text>
            <TextInput
              style={S.input}
              placeholder="ตั้งชื่อผู้ใช้งาน"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View>
            <Text style={S.label}>PASSWORD</Text>
            <TextInput
              style={S.input}
              placeholder="ตั้งรหัสผ่าน"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View>
            <Text style={S.label}>CONFIRM PASSWORD</Text>
            <TextInput
              style={S.input}
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <TouchableOpacity style={S.btnPrimary} onPress={handleRegister}>
          <Text style={S.btnPrimaryText}>ยืนยันการสมัครสมาชิก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.btnBack} onPress={() => router.back()}>
          <Text style={S.btnBackText}>⬅ ย้อนกลับไปหน้าเข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const S = {
  container: { flexGrow: 1, backgroundColor: '#f8fafc', justifyContent: 'center' as const, padding: 20 },
  card: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 22, fontWeight: 'bold' as const, color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  label: { fontSize: 11, fontWeight: 'bold' as const, color: '#475569', marginBottom: 4 },
  input: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 13, color: '#0f172a' },
  btnPrimary: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center' as const, marginTop: 8 },
  btnPrimaryText: { color: '#ffffff', fontWeight: 'bold' as const, fontSize: 14 },
  btnBack: { padding: 12, alignItems: 'center' as const, marginTop: 10 },
  btnBackText: { color: '#64748b', fontWeight: 'bold' as const, fontSize: 13 },
};