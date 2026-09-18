import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddPatientScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('ชาย');
  const [status, setStatus] = useState('Normal Sinus Rhythm');
  const [level, setLevel] = useState('NORMAL');

  const handleSave = () => {
    if (!name || !age) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดระบุชื่อ-นามสกุล และอายุผู้ป่วย');
      return;
    }

    Alert.alert('บันทึกสำเร็จ', `เพิ่มข้อมูลผู้ป่วย ${name} เรียบร้อยแล้ว`, [
      { text: 'ตกลง', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>➕ ลงทะเบียนผู้ป่วยใหม่ (Add Patient)</Text>

      <View style={styles.card}>
        {/* ชื่อ-นามสกุล */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ชื่อ - นามสกุล *</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น นายสมชาย ใจดี"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* อายุ & เพศ */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>อายุ (ปี) *</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 45"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>เพศ</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['ชาย', 'หญิง'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* เลือกระดับความเสี่ยง */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ระดับความเสี่ยง (Status Level)</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {[
              { code: 'NORMAL', color: '#16a34a' },
              { code: 'WARNING', color: '#d97706' },
              { code: 'CRITICAL', color: '#dc2626' },
              { code: 'EMERGENCY', color: '#991b1b' },
            ].map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.levelBtn,
                  level === item.code && { backgroundColor: item.color, borderColor: item.color },
                ]}
                onPress={() => setLevel(item.code)}
              >
                <Text style={[styles.levelText, level === item.code && { color: '#ffffff' }]}>
                  {item.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ผลวินิจฉัยเบื้องต้น */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ผลวินิจฉัย / สถานะ ECG เบื้องต้น</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น Normal Sinus Rhythm, AFib Detected"
            placeholderTextColor="#94a3b8"
            value={status}
            onChangeText={setStatus}
          />
        </View>

        {/* ปุ่มบันทึก */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>💾 บันทึกข้อมูลผู้ป่วย</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, color: '#0f172a' },
  genderBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', backgroundColor: '#f1f5f9' },
  genderBtnActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  genderText: { fontSize: 13, color: '#475569', fontWeight: 'bold' },
  genderTextActive: { color: '#ffffff' },
  levelBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f1f5f9' },
  levelText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  saveBtn: { backgroundColor: '#0284c7', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});