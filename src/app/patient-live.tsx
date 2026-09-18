import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const getPatientImage = (key: string) => {
  try {
    switch (key) {
      case 'PT1': return require('../../assets/images/afib.jpg');
      case 'PT2': return require('../../assets/images/lvh.jpg');
      case 'PT3': return require('../../assets/images/normal.jpg');
      case 'PT4': return require('../../assets/images/vfib.jpg');
      default: return null;
    }
  } catch (e) {
    return null;
  }
};

const PATIENTS: Record<string, any> = {
  PT1: { name: 'กรองแก้ว บุญมี', age: 62, gender: 'หญิง', hr: 112, spo2: 96, bp: '138/88', status: 'AFib Detected', conf: 96.8, level: 'CRITICAL', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  PT2: { name: 'วรรณรสา อรุณรัศมิ์', age: 58, gender: 'หญิง', hr: 88, spo2: 98, bp: '145/92', status: 'LVH Detected', conf: 92.4, level: 'WARNING', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  PT3: { name: 'พุฒิภัทร จุฑาเทพ', age: 45, gender: 'ชาย', hr: 72, spo2: 99, bp: '120/80', status: 'Normal Sinus Rhythm', conf: 99.1, level: 'NORMAL', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  PT4: { name: 'มารตี เทวพรหม', age: 67, gender: 'หญิง', hr: 185, spo2: 89, bp: '90/60', status: 'Ventricular Fibrillation (VFib)', conf: 98.9, level: 'EMERGENCY', color: '#991b1b', bg: '#ffe4e6', border: '#f87171' },
};

function VitalBox({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <View style={[styles.card, { flex: 1, alignItems: 'center', padding: 8, marginBottom: 0 }]}>
      <Text style={{ color: '#64748b', fontSize: 9, fontWeight: 'bold' }}>{label}</Text>
      <Text style={{ color, fontSize: 18, fontWeight: 'bold', marginVertical: 2 }}>{value}</Text>
      <Text style={{ color: '#94a3b8', fontSize: 9 }}>{unit}</Text>
    </View>
  );
}

export default function PatientLiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawId = params.patientId || params.id;
  const activeId = String(Array.isArray(rawId) ? rawId[0] : rawId || 'PT1').toUpperCase().trim();
  
  const patient = PATIENTS[activeId] || PATIENTS['PT1'];
  const activeImage = getPatientImage(activeId);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof patient | null>(null);

  const runAI = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult(patient);
    }, 1200);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16 }}>
      {/* Header Profile Specific Patient */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.badge, { backgroundColor: patient.color }]}>{activeId}</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>{patient.name}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{patient.gender} • {patient.age} ปี</Text>
          </View>
          <Text style={{ color: patient.color, fontWeight: 'bold', fontSize: 12 }}>
            {activeId === 'PT4' ? '🚨 EMERGENCY' : '● LIVE'}
          </Text>
        </View>
      </View>

      {/* Vitals Grid */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <VitalBox label="HEART RATE" value={patient.hr} unit="BPM" color={patient.color} />
        <VitalBox label="SpO2" value={`${patient.spo2}%`} unit="O2 Sat" color={patient.spo2 < 90 ? '#dc2626' : '#2563eb'} />
        <VitalBox label="BP" value={patient.bp} unit="mmHg" color={activeId === 'PT4' ? '#dc2626' : '#16a34a'} />
      </View>

      {/* ECG Image */}
      <View style={styles.card}>
        <Text style={{ color: '#0284c7', fontWeight: 'bold', marginBottom: 8 }}>⚡ LEAD II ECG WAVEFORM ({activeId})</Text>
        <View style={styles.imgBox}>
          {activeImage ? (
            <Image source={activeImage} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
              <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: 'bold' }}>📈 [ ECG Waveform Signal - {activeId} ]</Text>
            </View>
          )}
        </View>
      </View>

      {/* AI Diagnosis */}
      <View style={styles.card}>
        <Text style={{ color: '#0f172a', fontWeight: 'bold', marginBottom: 8 }}>🤖 AI DIAGNOSIS</Text>
        {result ? (
          <View style={[styles.resBox, { borderColor: result.border, backgroundColor: result.bg }]}>
            <Text style={{ color: result.color, fontWeight: 'bold', fontSize: 15 }}>{result.level}: {result.status}</Text>
            <Text style={{ color: '#334155', fontSize: 12, marginTop: 2 }}>Confidence: {result.conf}%</Text>
          </View>
        ) : (
          <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>กดปุ่มด้านล่างเพื่อเริ่มประมวลผลสัญญาณ ECG ด้วย AI</Text>
        )}

        <TouchableOpacity 
          style={[styles.btnPrimary, { backgroundColor: patient.color }]} 
          onPress={runAI} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>RUN AI DIAGNOSIS</Text>}
        </TouchableOpacity>
      </View>

      {/* ปุ่มกดดูประวัติย้อนหลัง */}
      <TouchableOpacity 
        style={styles.btnSecondary} 
        onPress={() => router.push({ pathname: '/history', params: { patientId: activeId } })}
      >
        <Text style={styles.btnSecondaryText}>📋 ดูประวัติย้อนหลัง (PATIENT HISTORY) ➔</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  imgBox: { height: 170, width: '100%', backgroundColor: '#020617', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#cbd5e1' },
  badge: { color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, alignSelf: 'flex-start', marginBottom: 4, fontWeight: 'bold' },
  resBox: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  btnPrimary: { padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  btnSecondaryText: { color: '#334155', fontWeight: 'bold', fontSize: 13 },
});
