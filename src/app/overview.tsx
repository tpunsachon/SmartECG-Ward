import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

// กำหนดระดับความสำคัญ (ยิ่งตัวเลขน้อย ยิ่งอันตรายมาก)
const SEVERITY_RANK: Record<string, number> = {
  EMERGENCY: 1, // อันตรายสูงสุด
  CRITICAL: 2,  // วิกฤต
  WARNING: 3,   // เฝ้าระวัง
  NORMAL: 4,    // ปกติ
};

// ข้อมูลรายการผู้ป่วย
const INITIAL_PATIENTS = [
  { id: 'PT1', hn: 'HN 66-04912', name: 'กรองแก้ว บุญมี', gender: 'หญิง', age: 62, level: 'CRITICAL', defaultHr: 112 },
  { id: 'PT2', hn: 'HN 65-11084', name: 'วรรณรสา อรุณรัศมิ์', gender: 'หญิง', age: 58, level: 'WARNING', defaultHr: 88 },
  { id: 'PT3', hn: 'HN 67-00129', name: 'พุฒิภัทร จุฑาเทพ', gender: 'ชาย', age: 45, level: 'NORMAL', defaultHr: 72 },
  { id: 'PT4', hn: 'HN 64-08821', name: 'มารตี เทวพรหม', gender: 'หญิง', age: 67, level: 'EMERGENCY', defaultHr: 185 },
  { id: 'PT5', hn: 'HN 68-00512', name: 'รณ นภาลัย', gender: 'ชาย', age: 32, level: 'NORMAL', defaultHr: 75 },
];

// ฟังก์ชันคำนวณและประเมินระดับความอันตรายจากค่า HR Realtime
const evaluatePatientStatus = (hr: number | null, defaultLevel: string) => {
  if (hr === null) {
    return {
      level: defaultLevel,
      text: 'รอสัญญาณ...',
      color: '#64748b',
      bg: '#f1f5f9',
      rank: SEVERITY_RANK[defaultLevel] || 4,
    };
  }

  if (hr >= 140 || hr <= 40) {
    return {
      level: 'EMERGENCY',
      text: 'EMERGENCY (วิกฤตขั้นสูง)',
      color: '#991b1b',
      bg: '#ffe4e6',
      rank: SEVERITY_RANK.EMERGENCY,
    };
  } else if (hr > 100 || hr < 50) {
    return {
      level: 'CRITICAL',
      text: 'CRITICAL (เสี่ยงสูง)',
      color: '#dc2626',
      bg: '#fef2f2',
      rank: SEVERITY_RANK.CRITICAL,
    };
  } else if (hr < 60) {
    return {
      level: 'WARNING',
      text: 'WARNING (ช้ากว่าเกณฑ์)',
      color: '#d97706',
      bg: '#fffbeb',
      rank: SEVERITY_RANK.WARNING,
    };
  } else {
    return {
      level: 'NORMAL',
      text: 'NORMAL (ปกติ)',
      color: '#16a34a',
      bg: '#f0fdf4',
      rank: SEVERITY_RANK.NORMAL,
    };
  }
};

export default function OverviewScreen() {
  const router = useRouter();
  
  // State เก็บค่า HR Realtime ของแต่ละคน
  const [patientHRs, setPatientHRs] = useState<Record<string, number>>({
    PT1: 112,
    PT2: 88,
    PT3: 72,
    PT4: 185,
    PT5: 75,
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>('PT4'); // ค่าเริ่มต้นเลือกอันตรายสุด

  // Subscribe ฟังค่า ESP32 Realtime จาก Supabase
  useEffect(() => {
    const channel = supabase
      .channel('ward-realtime-hr')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'patient_monitors' },
        (payload) => {
          const { patient_id, hr } = payload.new;
          if (patient_id && hr) {
            setPatientHRs((prev) => ({ ...prev, [patient_id]: hr }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // จัดเรียงลำดับผู้ป่วยตามระดับความอันตราย (เรียง rank จากน้อยไปมาก)
  const sortedPatients = useMemo(() => {
    return [...INITIAL_PATIENTS]
      .map((p) => {
        const currentHr = patientHRs[p.id] ?? p.defaultHr;
        const evalResult = evaluatePatientStatus(currentHr, p.level);
        return { ...p, currentHr, evalResult };
      })
      .sort((a, b) => a.evalResult.rank - b.evalResult.rank);
  }, [patientHRs]);

  const selectedPatient = sortedPatients.find((p) => p.id === selectedPatientId) || sortedPatients[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>🏥 Ward Monitoring</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
          onPress={() => router.replace('/login')}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* 🔴 1. กล่อง HR Realtime ปรับลดขนาดลง 5% */}
      <View style={[S.largeHrCard, { backgroundColor: selectedPatient.evalResult.bg, borderColor: selectedPatient.evalResult.color }]}>
        <Text style={{ fontSize: 12.35, fontWeight: 'bold', color: '#64748b' }}>
          LIVE SENSOR MONITORING ({selectedPatient.name} - {selectedPatient.id})
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginVertical: 7.6 }}>
          <Text style={{ fontSize: 60.8, fontWeight: 'bold', color: selectedPatient.evalResult.color }}>
            {selectedPatient.currentHr ?? '--'}
          </Text>
          <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#64748b', marginLeft: 7.6 }}>BPM</Text>
        </View>

        <View style={{ backgroundColor: selectedPatient.evalResult.color, paddingHorizontal: 13.3, paddingVertical: 3.8, borderRadius: 19 }}>
          <Text style={{ color: '#fff', fontSize: 11.4, fontWeight: 'bold' }}>{selectedPatient.evalResult.text}</Text>
        </View>
      </View>

      {/* 🔵 2. รายชื่อผู้ป่วย (เรียงตามระดับความอันตราย) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
          รายชื่อผู้ป่วย (เรียงตามความวิกฤต 🚨):
        </Text>
      </View>

      {sortedPatients.map((p) => {
        const isSelected = p.id === selectedPatientId;
        return (
          <TouchableOpacity
            key={p.id}
            style={[
              S.patientNameCard, 
              { borderLeftColor: p.evalResult.color, borderLeftWidth: 6 },
              isSelected && S.selectedCard
            ]}
            onPress={() => setSelectedPatientId(p.id)}
          >
            <View style={{ flex: 1 }}>
              {/* ชื่อผู้ป่วย */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>{p.name}</Text>

              {/* แสดงเพศ, อายุ และ HN */}
              <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {p.gender} • {p.age} ปี | {p.id} • {p.hn}
              </Text>
            </View>

            <TouchableOpacity
              style={S.detailBtn}
              onPress={() => router.push({ pathname: '/live', params: { patientId: p.id } })}
            >
              <Text style={{ color: '#0284c7', fontWeight: 'bold', fontSize: 13 }}>ดูข้อมูล ➔</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const S = {
  largeHrCard: {
    padding: 19, // ลด 5% (จาก 20 -> 19)
    borderRadius: 15.2, // ลด 5% (จาก 16 -> 15.2)
    borderWidth: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 19, // ลด 5% (จาก 20 -> 19)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  patientNameCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  selectedCard: {
    backgroundColor: '#fcfcfc',
    borderColor: '#177bad',
  },
  detailBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
};