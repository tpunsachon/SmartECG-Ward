import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";

import { supabase } from "../../lib/supabase";

const SEVERITY_RANK: Record<string, number> = {
  EMERGENCY: 1,
  CRITICAL: 2,
  WARNING: 3,
  NORMAL: 4,
};

const INITIAL_PATIENTS = [
  {
    id: "PT1",
    hn: "HN 66-04912",
    name: "กรองแก้ว บุญมี",
    gender: "หญิง",
    age: 62,
    level: "CRITICAL",
    status: "AFib Detected",
    defaultHr: 112,
  },
  {
    id: "PT2",
    hn: "HN 65-11084",
    name: "วรรณรสา อรุณรัศมิ์",
    gender: "หญิง",
    age: 58,
    level: "WARNING",
    status: "LVH Detected",
    defaultHr: 88,
  },
  {
    id: "PT3",
    hn: "HN 67-00129",
    name: "พุฒิภัทร จุฑาเทพ",
    gender: "ชาย",
    age: 45,
    level: "NORMAL",
    status: "Normal Sinus Rhythm",
    defaultHr: 72,
  },
  {
    id: "PT4",
    hn: "HN 64-08821",
    name: "มารตี เทวพรหม",
    gender: "หญิง",
    age: 67,
    level: "EMERGENCY",
    status: "Ventricular Fibrillation (VFib)",
    defaultHr: 185,
  },
  {
    id: "PT5",
    hn: "HN 68-00512",
    name: "รณ นภาลัย",
    gender: "ชาย",
    age: 32,
    level: "NORMAL",
    status: "Normal Sinus Rhythm",
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
  created_at?: string;
};

const evaluatePatientStatus = (hr: number | null, defaultLevel: string) => {
  if (hr === null) {
    const level = String(defaultLevel || "NORMAL").toUpperCase();
    return {
      level,
      text: "รอสัญญาณ...",
      color:
        level === "EMERGENCY"
          ? "#991b1b"
          : level === "CRITICAL"
            ? "#dc2626"
            : level === "WARNING"
              ? "#d97706"
              : "#16a34a",
      bg:
        level === "EMERGENCY"
          ? "#ffe4e6"
          : level === "CRITICAL"
            ? "#fef2f2"
            : level === "WARNING"
              ? "#fffbeb"
              : "#f0fdf4",
      rank: SEVERITY_RANK[level] || 4,
    };
  }
  if (hr <= 0) {
    return {
      level: "ERROR",
      text: "เกิดข้อผิดพลาดจาก Sensor",
      color: "#64748b", // สีเทา
      bg: "#f1f5f9", // พื้นหลังสีเทาอ่อน
      rank: 5,
    };
  }
  if (hr >= 140 || hr <= 40) {
    return {
      level: "EMERGENCY",
      text: "EMERGENCY",
      color: "#991b1b",
      bg: "#ffe4e6",
      rank: SEVERITY_RANK.EMERGENCY,
    };
  }

  if (hr > 100 || hr < 50) {
    return {
      level: "CRITICAL",
      text: "CRITICAL",
      color: "#dc2626",
      bg: "#fef2f2",
      rank: SEVERITY_RANK.CRITICAL,
    };
  }

  if (hr < 60) {
    return {
      level: "WARNING",
      text: "WARNING",
      color: "#d97706",
      bg: "#fffbeb",
      rank: SEVERITY_RANK.WARNING,
    };
  }

  return {
    level: "NORMAL",
    text: "NORMAL",
    color: "#16a34a",
    bg: "#f0fdf4",
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

  // State สำหรับเก็บค่าเซนเซอร์สด Real-time (HR และ SpO2)
  const [liveSensor, setLiveSensor] = useState<{
    hr: number | null;
    spo2: number | null;
  }>({
    hr: null,
    spo2: null,
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>("PT4");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ดึงข้อมูลเซนเซอร์ล่าสุดจาก patient_monitors
  const fetchLatestSensorData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("patient_monitors")
        .select("hr, spo2")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLiveSensor({
          hr:
            data.hr !== null && data.hr !== undefined ? Number(data.hr) : null,
          spo2:
            data.spo2 !== null && data.spo2 !== undefined
              ? Number(data.spo2)
              : null,
        });
      }
    } catch (e) {
      console.error("Fetch latest sensor error:", e);
    }
  }, []);

  // ดึงรายการ ID ผู้ป่วยจำลองที่เคยถูกลบจาก AsyncStorage
  const loadDeletedLocalIds = async () => {
    try {
      const saved = await AsyncStorage.getItem("DELETED_PATIENT_IDS");
      if (saved) {
        const parsed = JSON.parse(saved);
        setDeletedLocalIds(parsed);
        return parsed;
      }
    } catch (e) {
      console.error("Error loading deleted IDs:", e);
    }
    return [];
  };

  // ดึงข้อมูลผู้ป่วย
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const currentDeletedIds = await loadDeletedLocalIds();

      // ดึงข้อมูลผู้ป่วยทั้งหมดที่มีใน Supabase
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          id,
          hn,
          name,
          age,
          gender,
          level,
          status,
          ecg_image,
          created_at
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch Patients Error:", error);
        setErrorMessage(error.message);
        setPatients(
          INITIAL_PATIENTS.filter((p) => !currentDeletedIds.includes(p.id)),
        );
        return;
      }

      const databasePatients: Patient[] = (data || []).map((item: any) => ({
        id: String(item.id),
        hn: String(item.hn || "-"),
        name: String(item.name || "-"),
        gender: String(item.gender || "-"),
        age: Number(item.age || 0),
        level: String(item.level || "NORMAL").toUpperCase(),
        status: String(item.status || "Normal Sinus Rhythm"),
        ecg_image: item.ecg_image || null,
        created_at: item.created_at || undefined,
      }));

      const activeInitialPatients = INITIAL_PATIENTS.filter(
        (p) => !currentDeletedIds.includes(p.id),
      );

      const dbIds = new Set(databasePatients.map((p) => p.id));
      const dbHns = new Set(databasePatients.map((p) => p.hn));

      const filteredInitialPatients = activeInitialPatients.filter(
        (p) => !dbIds.has(p.id) && !dbHns.has(p.hn),
      );

      const allPatients: Patient[] = [
        ...filteredInitialPatients,
        ...databasePatients,
      ];

      setPatients(allPatients);

      setSelectedPatientId((current) => {
        const currentExists = allPatients.some(
          (patient) => patient.id === current,
        );
        if (currentExists) return current;
        return allPatients[0]?.id || "";
      });
    } catch (error: any) {
      console.error("Fetch Patients Exception:", error);
      setErrorMessage(error?.message || "ไม่สามารถโหลดข้อมูลผู้ป่วยได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
      fetchLatestSensorData();
    }, [fetchPatients, fetchLatestSensorData]),
  );

  // Hard Delete: ลบออกจาก Database ตลอดกาล
  const handleHardDelete = (patient: Patient) => {
    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบข้อมูลของ "${patient.name}" ออกจากระบบตลอดกาลใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบถาวร",
          style: "destructive",
          onPress: async () => {
            try {
              if (!patient.id.startsWith("PT")) {
                const { error } = await supabase
                  .from("patients")
                  .delete()
                  .eq("id", patient.id);

                if (error) {
                  Alert.alert("เกิดข้อผิดพลาดในการลบ", error.message);
                  return;
                }
              } else {
                const updatedDeleted = [...deletedLocalIds, patient.id];
                setDeletedLocalIds(updatedDeleted);
                await AsyncStorage.setItem(
                  "DELETED_PATIENT_IDS",
                  JSON.stringify(updatedDeleted),
                );
              }

              setPatients((prev) => prev.filter((p) => p.id !== patient.id));

              if (selectedPatientId === patient.id) {
                const remaining = patients.filter((p) => p.id !== patient.id);
                if (remaining.length > 0) {
                  setSelectedPatientId(remaining[0].id);
                }
              }
            } catch (err: any) {
              console.error("Hard delete error:", err);
              Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้");
            }
          },
        },
      ],
    );
  };

  // Realtime Subscription รับข้อมูล hr และ spo2 จาก patient_monitors
  useEffect(() => {
    const channel = supabase
      .channel("ward-realtime-hr")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "patient_monitors",
        },
        (payload) => {
          const patientId = payload.new?.patient_id;
          const hr = payload.new?.hr;
          const spo2 = payload.new?.spo2;

          // อัปเดตค่า liveSensor ทันทีเมื่อมีข้อมูลใหม่เข้ามาใน patient_monitors
          setLiveSensor({
            hr: hr !== undefined && hr !== null ? Number(hr) : null,
            spo2: spo2 !== undefined && spo2 !== null ? Number(spo2) : null,
          });

          if (patientId && hr !== null) {
            setPatientHRs((previous) => ({
              ...previous,
              [String(patientId)]: Number(hr),
            }));
          }
        },
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

  // คำนวณค่า HR และการประเมินผลสำหรับกล่อง LIVE SENSOR
  const activeHr = liveSensor.hr ?? selectedPatient?.currentHr ?? null;
  const activeSpo2 = liveSensor.spo2 ?? null;
  const isZeroSensor = liveSensor.hr === 0 || liveSensor.spo2 === 0;

  const liveEval = isZeroSensor
    ? {
        level: "ERROR",
        text: "Waiting for Sensor Signal...",
        color: "#64748b",
        bg: "#f1f5f9",
        rank: 5,
      }
    : evaluatePatientStatus(activeHr, selectedPatient?.level || "NORMAL");

  const renderRightActions = (patient: Patient) => {
    return (
      <TouchableOpacity
        style={styles.deleteSwipeButton}
        onPress={() => handleHardDelete(patient)}
      >
        <Text style={styles.deleteSwipeText}>🗑️ ลบ</Text>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc", padding: 16 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🏥 Ward Monitoring</Text>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={{ marginTop: 10, color: "#64748b", fontSize: 13 }}>
              กำลังโหลดข้อมูลผู้ป่วย...
            </Text>
          </View>
        )}

        {!loading && errorMessage && (
          <View style={styles.errorBox}>
            <Text
              style={{ color: "#dc2626", fontWeight: "bold", fontSize: 12 }}
            >
              ⚠ ไม่สามารถโหลดข้อมูล จาก Supabase ได้
            </Text>
            <Text style={{ color: "#7f1d1d", fontSize: 11, marginTop: 4 }}>
              {errorMessage}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchPatients}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>
                ลองใหม่
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ✅ กล่อง LIVE SENSOR MONITORING (แสดงค่า BPM และ SpO2 Real-time) */}
        {/* ------------------------------------------------------------- */}
        {selectedPatient && (
          <View
            style={[
              styles.largeHrCard,
              {
                backgroundColor: liveEval.bg,
                borderColor: liveEval.color,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              LIVE SENSOR MONITORING
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100%",
                marginVertical: 12,
              }}
            >
              {/* ค่า HR / BPM */}
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: 2,
                  }}
                >
                  HEART RATE
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text
                    style={{
                      fontSize: 48,
                      fontWeight: "bold",
                      color: liveEval.color,
                    }}
                  >
                    {activeHr !== null ? activeHr : "--"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#64748b",
                      marginLeft: 4,
                    }}
                  >
                    BPM
                  </Text>
                </View>
              </View>

              {/* เส้นแบ่งกลาง */}
              <View
                style={{ width: 1, height: 40, backgroundColor: "#cbd5e1" }}
              />

              {/* ค่า SpO2 (%) */}
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: 2,
                  }}
                >
                  SpO2
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text
                    style={{
                      fontSize: 48,
                      fontWeight: "bold",
                      color: "#0284c7",
                    }}
                  >
                    {activeSpo2 !== null ? activeSpo2 : "--"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#64748b",
                      marginLeft: 4,
                    }}
                  >
                    %
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: liveEval.color,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>
                {liveEval.text}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#0f172a",
              flex: 1,
            }}
          >
            รายชื่อผู้ป่วย (ปัดซ้ายเพื่อลบ)
          </Text>
          <TouchableOpacity
            style={styles.addPatientBtn}
            onPress={() => router.push("/add-patient")}
          >
            <Text style={styles.addPatientText}>＋ Add New Patient</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}>
          ผู้ป่วยทั้งหมด {sortedPatients.length} คน
        </Text>

        {sortedPatients.map((patient, index) => {
          const isSelected = patient.id === selectedPatientId;

          return (
            <Swipeable
              key={`patient-${patient.id}-${index}`}
              renderRightActions={() => renderRightActions(patient)}
              overshootRight={false}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.patientNameCard,
                  {
                    borderLeftColor: patient.evalResult.color,
                    borderLeftWidth: 6,
                  },
                  isSelected && styles.selectedCard,
                ]}
                onPress={() => setSelectedPatientId(patient.id)}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#0f172a",
                    }}
                  >
                    {patient.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}
                  >
                    {patient.gender} • {patient.age} ปี
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/live",
                      params: { patientId: patient.id },
                    })
                  }
                >
                  <Text
                    style={{
                      color: "#0284c7",
                      fontWeight: "bold",
                      fontSize: 13,
                    }}
                  >
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  signOutBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signOutText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  loadingBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deleteSwipeButton: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "84%",
    borderRadius: 12,
    marginBottom: 10,
  },
  deleteSwipeText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  largeHrCard: {
    padding: 19,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 19,
    elevation: 3,
  },
  patientNameCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCard: { backgroundColor: "#fcfcfc", borderColor: "#177bad" },
  detailBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  addPatientBtn: {
    backgroundColor: "#0284c7",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  addPatientText: { color: "#ffffff", fontSize: 11, fontWeight: "bold" },
});
