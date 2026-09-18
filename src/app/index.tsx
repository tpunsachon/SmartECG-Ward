import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const PATIENTS = [
  { id: 'PT1', name: 'กรองแก้ว บุญมี', age: 62, gender: 'หญิง', status: 'AFib Detected', level: 'CRITICAL', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  { id: 'PT2', name: 'วรรณรสา อรุณรัศมิ์', age: 58, gender: 'หญิง', status: 'LVH Detected', level: 'WARNING', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { id: 'PT3', name: 'พุฒิภัทร จุฑาเทพ', age: 45, gender: 'ชาย', status: 'Normal Sinus Rhythm', level: 'NORMAL', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  { id: 'PT4', name: 'มารตี เทวพรหม', age: 67, gender: 'หญิง', status: 'Ventricular Fibrillation (VFib)', level: 'EMERGENCY', color: '#991b1b', bg: '#ffe4e6', border: '#f87171' },
];

export default function OverviewScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16 }}>
      {/* Header + ปุ่มเพิ่มผู้ป่วย */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
          สถานะผู้ป่วยในวอร์ด (Overview)
        </Text>
        
        <TouchableOpacity
          onPress={() => router.push('/add-patient')}
          style={{ backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12 }}>➕ เพิ่มผู้ป่วย</Text>
        </TouchableOpacity>
      </View>

      {PATIENTS.map((p) => (
        <TouchableOpacity
          key={p.id}
          activeOpacity={0.7}
          style={{
            backgroundColor: p.bg,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: p.border,
            borderLeftWidth: 6,
            borderLeftColor: p.color,
          }}
          onPress={() => router.push({ pathname: '/patient-live', params: { patientId: p.id } })}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: p.color }}>{p.id} • {p.level}</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 2 }}>{p.name}</Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{p.gender} • {p.age} ปี</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: p.color }}>{p.status}</Text>
              <Text style={{ fontSize: 12, color: '#0284c7', fontWeight: 'bold', marginTop: 12 }}>ดูข้อมูลสด ➔</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}