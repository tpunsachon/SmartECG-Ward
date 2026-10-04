import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  useRouter,
  useFocusEffect,
} from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { supabase } from '../../lib/supabase';

const SEVERITY_RANK: Record<string, number> = {
  EMERGENCY: 1,
  CRITICAL: 2,
  WARNING: 3,
  NORMAL: 4,
};

const INITIAL_PATIENTS = [
  {
    id: 'PT1',
    hn: 'HN 66-04912',
    name: 'กรองแก้ว บุญมี',
    gender: 'หญิง',
    age: 62,
    level: 'CRITICAL',
    status: 'AFib Detected',
    defaultHr: 112,
  },
  {
    id: 'PT2',
    hn: 'HN 65-11084',
    name: 'วรรณรสา อรุณรัศมิ์',
    gender: 'หญิง',
    age: 58,
    level: 'WARNING',
    status: 'LVH Detected',
    defaultHr: 88,
  },
  {
    id: 'PT3',
    hn: 'HN 67-00129',
    name: 'พุฒิภัทร จุฑาเทพ',
    gender: 'ชาย',
    age: 45,
    level: 'NORMAL',
    status: 'Normal Sinus Rhythm',
    defaultHr: 72,
  },
  {
    id: 'PT4',
    hn: 'HN 64-08821',
    name: 'มารตี เทวพรหม',
    gender: 'หญิง',
    age: 67,
    level: 'EMERGENCY',
    status: 'Ventricular Fibrillation (VFib)',
    defaultHr: 185,
  },
  {
    id: 'PT5',
    hn: 'HN 68-00512',
    name: 'รณ นภาลัย',
    gender: 'ชาย',
    age: 32,
    level: 'NORMAL',
    status: 'Normal Sinus Rhythm',
    defaultHr: 75,
  },
];

type Patient = {
  id: string;
  hn: string;
  name: string;
  gender: string;
  age: number;
  level: string;
  status: string;
  defaultHr?: number;
  currentHr?: number | null;
  ecg_image?: string | null;
  is_deleted?: boolean;
  created_at?: string;
};

const evaluatePatientStatus = (hr: number | null, defaultLevel: string) => {
  if (hr === null) {
    const level = String(defaultLevel || 'NORMAL').toUpperCase();
    return {
      level,
      text: 'รอสัญญาณ...',
      color:
        level === 'EMERGENCY'
          ? '#991b1b'
          : level === 'CRITICAL'
          ? '#dc2626'
          : level === 'WARNING'
          ? '#d97706'
          : '#16a34a',
      bg:
        level === 'EMERGENCY'
          ? '#ffe4e6'
          : level === 'CRITICAL'
          ? '#fef2f2'
          : level === 'WARNING'
          ? '#fffbeb'
          : '#f0fdf4',
      rank: SEVERITY_RANK[level] || 4,
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
  }

  if (hr > 100 || hr < 50) {
    return {
      level: 'CRITICAL',
      text: 'CRITICAL (เสี่ยงสูง)',
      color: '#dc2626',
      bg: '#fef2f2',
      rank: SEVERITY_RANK.CRITICAL,
    };
  }

  if (hr < 60) {
    return {
      level: 'WARNING',
      text: 'WARNING (ช้ากว่าเกณฑ์)',
      color: '#d97706',
      bg: '#fffbeb',
      rank: SEVERITY_RANK.WARNING,
    };
  }

  return {
    level: 'NORMAL',
    text: 'NORMAL (ปกติ)',
    color: '#16a34a',
    bg: '#f0fdf4',
    rank: SEVERITY_RANK.NORMAL,
  };
};

export default function OverviewScreen() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [deletedLocalIds, setDeletedLocalIds] = useState<string[]>([]);
  const [patientHRs, setPatientHRs] = useState<Record<string, number>>({
    PT1: 112,
    PT2: 88,
    PT3: 72,
    PT4: 185,
    PT5: 75,
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>('PT4');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ดึงรายการ ID ผู้ป่วยจำลองที่เคยถูกลบจาก AsyncStorage
  const loadDeletedLocalIds = async () => {
    try {
      const saved = await AsyncStorage.getItem('DELETED_PATIENT_IDS');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDeletedLocalIds(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading deleted IDs:', e);
    }
    return [];
  };

  // ดึงข้อมูลผู้ป่วย
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const currentDeletedIds = await loadDeletedLocalIds();

      // ดึงเฉพาะผู้ป่วยใน Supabase ที่ไม่ถูกลบ
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          hn,
          name,
          age,
          gender,
          level,
          status,
          ecg_image,
          is_deleted,
          created_at
        `)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch Patients Error:', error);
        setErrorMessage(error.message);
        setPatients(INITIAL_PATIENTS.filter(p => !currentDeletedIds.includes(p.id)));
        return;
      }

      const databasePatients: Patient[] = (data || []).map((item: any) => ({
        id: String(item.id),
        hn: String(item.hn || '-'),
        name: String(item.name || '-'),
        gender: String(item.gender || '-'),
        age: Number(item.age || 0),
        level: String(item.level || 'NORMAL').toUpperCase(),
        status: String(item.status || 'Normal Sinus Rhythm'),
        ecg_image: item.ecg_image || null,
        is_deleted: item.is_deleted || false,
        created_at: item.created_at || undefined,
      }));

      const activeInitialPatients = INITIAL_PATIENTS.filter(
        (p) => !currentDeletedIds.includes(p.id)
      );

      const allPatients: Patient[] = [
        ...activeInitialPatients,
        ...databasePatients,
      ];

      setPatients(allPatients);

      setSelectedPatientId((current) => {
        const currentExists = allPatients.some((patient) => patient.id === current);
        if (currentExists) return current;
        return allPatients[0]?.id || '';
      });
    } catch (error: any) {
      console.error('Fetch Patients Exception:', error);
      setErrorMessage(error?.message || 'ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [fetchPatients])
  );

  // Soft Delete
  const handleSoftDelete = (patient: Patient) => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบข้อมูลของ "${patient.name}" ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบข้อมูล',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!patient.id.startsWith('PT')) {
                // ลบใน Supabase
                const { error } = await supabase
                  .from('patients')
                  .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString(),
                  })
                  .eq('id', patient.id);

                if (error) {
                  Alert.alert('เกิดข้อผิดพลาด', error.message);
                  return;
                }
              } else {
                // บันทึกลง AsyncStorage สำหรับ PT1-PT5
                const updatedDeleted = [...deletedLocalIds, patient.id];
                setDeletedLocalIds(updatedDeleted);
                await AsyncStorage.setItem('DELETED_PATIENT_IDS', JSON.stringify(updatedDeleted));
              }

              // อัปเดต UI ทันที
              setPatients((prev) => prev.filter((p) => p.id !== patient.id));

              if (selectedPatientId === patient.id) {
                const remaining = patients.filter((p) => p.id !== patient.id);
                if (remaining.length > 0) {
                  setSelectedPatientId(remaining[0].id);
                }
              }
            } catch (err: any) {
              console.error('Soft delete error:', err);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const channel = supabase
      .channel('ward-realtime-hr')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patient_monitors',
        },
        (payload) => {
          const patientId = payload.new?.patient_id;
          const hr = payload.new?.hr;

          if (patientId && hr !== null) {
            setPatientHRs((previous) => ({
              ...previous,
              [String(patientId)]: Number(hr),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sortedPatients = useMemo(() => {
    return patients
      .map((patient) => {
        const currentHr = patientHRs[patient.id] ?? patient.defaultHr ?? null;
        const evalResult = evaluatePatientStatus(currentHr, patient.level);

        return {
          ...patient,
          currentHr,
          evalResult,
        };
      })
      .sort((a, b) => a.evalResult.rank - b.evalResult.rank);
  }, [patients, patientHRs]);

  const selectedPatient =
    sortedPatients.find((patient) => patient.id === selectedPatientId) ||
    sortedPatients[0];

  const renderRightActions = (patient: Patient) => {
    return (
      <TouchableOpacity
        style={styles.deleteSwipeButton}
        onPress={() => handleSoftDelete(patient)}
      >
        <Text style={styles.deleteSwipeText}>🗑️ ลบ</Text>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🏥 Ward Monitoring</Text>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>
              กำลังโหลดข้อมูลผู้ป่วย...
            </Text>
          </View>
        )}

        {!loading && errorMessage && (
          <View style={styles.errorBox}>
            <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}>
              ⚠️ ไม่สามารถโหลดข้อมูล จาก Supabase ได้
            </Text>
            <Text style={{ color: '#7f1d1d', fontSize: 11, marginTop: 4 }}>
              {errorMessage}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchPatients}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                ลองใหม่
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedPatient && (
          <View
            style={[
              S.largeHrCard,
              {
                backgroundColor: selectedPatient.evalResult.bg,
                borderColor: selectedPatient.evalResult.color,
              },
            ]}
          >
            <Text style={{ fontSize: 12.35, fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>
              LIVE SENSOR MONITORING ({selectedPatient.name})
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginVertical: 7.6 }}>
              <Text style={{ fontSize: 60.8, fontWeight: 'bold', color: selectedPatient.evalResult.color }}>
                {selectedPatient.currentHr ?? '--'}
              </Text>
              <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#64748b', marginLeft: 7.6 }}>
                BPM
              </Text>
            </View>

            <View style={{ backgroundColor: selectedPatient.evalResult.color, paddingHorizontal: 13.3, paddingVertical: 3.8, borderRadius: 19 }}>
              <Text style={{ color: '#fff', fontSize: 11.4, fontWeight: 'bold' }}>
                {selectedPatient.evalResult.text}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a', flex: 1 }}>
            รายชื่อผู้ป่วย (ปัดซ้ายเพื่อลบ)
          </Text>
          <TouchableOpacity style={S.addPatientBtn} onPress={() => router.push('/add-patient')}>
            <Text style={S.addPatientText}>＋ Add New Patient</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#64748b', fontSize: 11, marginBottom: 8 }}>
          ผู้ป่วยทั้งหมด {sortedPatients.length} คน
        </Text>

        {sortedPatients.map((patient) => {
          const isSelected = patient.id === selectedPatientId;

          return (
            <Swipeable
              key={patient.id}
              renderRightActions={() => renderRightActions(patient)}
              overshootRight={false}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  S.patientNameCard,
                  {
                    borderLeftColor: patient.evalResult.color,
                    borderLeftWidth: 6,
                  },
                  isSelected && S.selectedCard,
                ]}
                onPress={() => setSelectedPatientId(patient.id)}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
                    {patient.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {patient.gender} • {patient.age} ปี
                  </Text>
                </View>

                <TouchableOpacity
                  style={S.detailBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/live',
                      params: { patientId: patient.id },
                    })
                  }
                >
                  <Text style={{ color: '#0284c7', fontWeight: 'bold', fontSize: 13 }}>
                    ดูข้อมูล ➔
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Swipeable>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  signOutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  signOutText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  loadingBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: 25, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10, padding: 12, marginBottom: 16 },
  retryBtn: { backgroundColor: '#dc2626', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  deleteSwipeButton: { backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', width: 80, height: '84%', borderRadius: 12, marginBottom: 10 },
  deleteSwipeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});

const S = {
  largeHrCard: { padding: 19, borderRadius: 15.2, borderWidth: 2, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 19, elevation: 3 },
  patientNameCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const },
  selectedCard: { backgroundColor: '#fcfcfc', borderColor: '#177bad' },
  detailBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  addPatientBtn: { backgroundColor: '#0284c7', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginLeft: 8 },
  addPatientText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
};