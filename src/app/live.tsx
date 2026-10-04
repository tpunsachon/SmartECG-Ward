import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../lib/supabase";

// =====================================================
// ข้อมูลผู้ป่วยเก่า (Mock Data PT1 - PT5)
// =====================================================

const OLD_PATIENTS: Record<string, any> = {
  PT1: {
    id: "PT1",
    hn: "HN 66-04912",
    name: "กรองแก้ว บุญมี",
    age: 62,
    gender: "หญิง",

    hr: 112,
    spo2: 96,
    bp: "138/88",

    status: "AFib Detected",
    conf: 96.8,
    level: "CRITICAL",

    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
  },

  PT2: {
    id: "PT2",
    hn: "HN 65-11084",
    name: "วรรณรสา อรุณรัศมิ์",
    age: 58,
    gender: "หญิง",

    hr: 88,
    spo2: 98,
    bp: "145/92",

    status: "LVH Detected",
    conf: 92.4,
    level: "WARNING",

    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },

  PT3: {
    id: "PT3",
    hn: "HN 67-00129",
    name: "พุฒิภัทร จุฑาเทพ",
    age: 45,
    gender: "ชาย",

    hr: 72,
    spo2: 99,
    bp: "120/80",

    status: "Normal Sinus Rhythm",
    conf: 99.1,
    level: "NORMAL",

    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
  },

  PT4: {
    id: "PT4",
    hn: "HN 64-08821",
    name: "มารตี เทวพรหม",
    age: 67,
    gender: "หญิง",

    hr: 185,
    spo2: 89,
    bp: "90/60",

    status: "Ventricular Fibrillation (VFib)",
    conf: 98.9,
    level: "EMERGENCY",

    color: "#991b1b",
    bg: "#ffe4e6",
    border: "#f87171",
  },

  PT5: {
    id: "PT5",
    hn: "HN 68-00512",
    name: "รณ นภาลัย",
    age: 32,
    gender: "ชาย",

    hr: 75,
    spo2: 99,
    bp: "120/80",

    status: "Normal Sinus Rhythm",
    conf: 99.0,
    level: "NORMAL",

    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
  },
};

// =====================================================
// รูป ECG ของผู้ป่วยเก่า
// =====================================================

const getOldPatientImage = (key: string) => {
  try {
    switch (key) {
      case "PT1":
        return require("../../assets/images/afib.jpg");

      case "PT2":
        return require("../../assets/images/lvh.jpg");

      case "PT3":
        return require("../../assets/images/normal.jpg");

      case "PT4":
        return require("../../assets/images/vfib.jpg");

      default:
        return null;
    }
  } catch (e) {
    console.log("ไม่พบรูป ECG ของผู้ป่วยเก่า:", e);
    return null;
  }
};

// =====================================================
// ประเมินสีจาก Level
// =====================================================

const getLevelStyle = (level: string) => {
  const value = String(level || "NORMAL").toUpperCase();

  switch (value) {
    case "EMERGENCY":
      return {
        color: "#991b1b",
        bg: "#ffe4e6",
        border: "#f87171",
      };

    case "CRITICAL":
      return {
        color: "#dc2626",
        bg: "#fef2f2",
        border: "#fca5a5",
      };

    case "WARNING":
      return {
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
      };

    default:
      return {
        color: "#16a34a",
        bg: "#f0fdf4",
        border: "#86efac",
      };
  }
};

// =====================================================
// ประเมิน Level จาก HR
// =====================================================

const evaluateLevelFromHR = (hr: number | null, defaultLevel: string) => {
  if (hr === null || hr === undefined || Number.isNaN(hr)) {
    return String(defaultLevel || "NORMAL").toUpperCase();
  }

  if (hr >= 140 || hr <= 40) {
    return "EMERGENCY";
  }

  if (hr > 100 || hr < 50) {
    return "CRITICAL";
  }

  if (hr < 60) {
    return "WARNING";
  }

  return "NORMAL";
};

// =====================================================
// Type ผู้ป่วย
// =====================================================

type Patient = {
  id: string;
  raw_db_id?: string;
  hn: string;

  name: string;
  age: number;
  gender: string;

  hr: number | null;
  spo2: number | null;
  bp: string | null;

  status: string;
  conf: number | null;
  level: string;

  color: string;
  bg: string;
  border: string;

  ecg_image?: string | null;
  created_at?: string;
};

// =====================================================
// Vital Box
// =====================================================

const VitalBox = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) => (
  <View
    style={[
      S.card,
      {
        flex: 1,
        alignItems: "center",
        padding: 8,
        marginBottom: 0,
      },
    ]}
  >
    <Text
      style={{
        color: "#64748b",
        fontSize: 9,
        fontWeight: "bold",
      }}
    >
      {label}
    </Text>

    <Text
      style={{
        color,
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 2,
      }}
    >
      {value}
    </Text>

    <Text
      style={{
        color: "#94a3b8",
        fontSize: 9,
      }}
    >
      {unit}
    </Text>
  </View>
);

// =====================================================
// LIVE SCREEN (src/app/live.tsx)
// =====================================================

export default function LiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State สำหรับควบคุม Modal แสดงรูปภาพแบบซูมได้
  const [isModalVisible, setIsModalVisible] = useState(false);

  const rawId = params.patientId || params.id;
  const paramKey = String(
    Array.isArray(rawId) ? rawId[0] : rawId || ""
  ).trim();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string>(paramKey || "PT1");
  const [loadingPatients, setLoadingPatients] = useState(true);

  // ดึงข้อมูลผู้ป่วย ซิงก์กับตาราง deleted_patients และป้องกัน Key/ID ซ้ำ
  const fetchPatients = useCallback(async () => {
    try {
      setLoadingPatients(true);

      // 1. ดึงข้อมูลผู้ป่วยจาก Database
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
            id,
            hn,
            name,
            age,
            gender,
            hr,
            spo2,
            bp,
            level,
            status,
            ecg_image,
            created_at
          `
        )
        .order("created_at", { ascending: true });

      // 2. ดึงรายการ ID ที่ถูกลบในตาราง deleted_patients
      const { data: deletedData } = await supabase
        .from("deleted_patients")
        .select("patient_id");

      const deletedIds = new Set(
        (deletedData || []).map((item: any) => String(item.patient_id))
      );

      if (error) {
        console.error("Fetch Live Patients Error:", error);
        const oldPatients = Object.values(OLD_PATIENTS)
          .map((item: any): Patient => ({ ...item }))
          .filter((item) => !deletedIds.has(item.id));
        setPatients(oldPatients);
        return;
      }

      // แปลงข้อมูลจาก Supabase
      const databasePatients: Patient[] = (data || []).map((item: any, index: number) => {
        const level = String(item.level || "NORMAL").toUpperCase();
        const style = getLevelStyle(level);
        const customId = item.id?.startsWith("PT") ? item.id : `PT${6 + index}`;

        return {
          id: customId,
          raw_db_id: String(item.id || ""),
          hn: String(item.hn || "-"),
          name: String(item.name || "-"),
          age: Number(item.age || 0),
          gender: String(item.gender || "-"),
          hr: item.hr !== null && item.hr !== undefined ? Number(item.hr) : null,
          spo2: item.spo2 !== null && item.spo2 !== undefined ? Number(item.spo2) : null,
          bp: item.bp ? String(item.bp) : null,
          status: String(item.status || "Normal Sinus Rhythm"),
          conf: null,
          level,
          color: style.color,
          bg: style.bg,
          border: style.border,
          ecg_image: item.ecg_image || null,
          created_at: item.created_at,
        };
      });

      // เก็บ ID จาก DB เพื่อเช็คป้องกัน Mock Data ซ้ำ
      const dbIds = new Set(databasePatients.map((p) => p.id));

      // กรอง Mock Data: ตัดคนโดนลบ และคนที่มีอยู่ใน Database แล้วออก
      const oldPatientsList = Object.values(OLD_PATIENTS).filter(
        (item: any) => !deletedIds.has(item.id) && !dbIds.has(item.id)
      );

      // รวมรายการผู้ป่วยทั้งหมดแบบไม่มี ID ซ้ำ และไม่มีคนโดนลบ
      const allPatients = [...oldPatientsList, ...databasePatients].filter(
        (p) => !deletedIds.has(p.id)
      );

      setPatients(allPatients);

      // แมตช์หาผู้ป่วยจาก paramKey ที่ส่งเข้ามาทันทีที่ดึงข้อมูลเสร็จ
      if (paramKey) {
        const matched = allPatients.find(
          (p) =>
            p.id === paramKey ||
            p.raw_db_id === paramKey ||
            p.hn === paramKey
        );
        if (matched) {
          setSelectedId(matched.id);
        }
      } else if (allPatients.length > 0) {
        // ถ้าคนที่เลือกอยู่โดนลบไป ให้เลือกคนแรกของรายการ
        setSelectedId((prev) => {
          const exists = allPatients.some((p) => p.id === prev);
          return exists ? prev : allPatients[0].id;
        });
      }
    } catch (e) {
      console.error("Fetch patients exception:", e);
    } finally {
      setLoadingPatients(false);
    }
  }, [paramKey]);

  // โหลดข้อมูลใหม่เมื่อผู้ใช้สลับมาหน้า Live Monitor
  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [fetchPatients])
  );

  useEffect(() => {
    if (!paramKey) return;
    const matched = patients.find(
      (p) =>
        p.id === paramKey ||
        p.raw_db_id === paramKey ||
        p.hn === paramKey
    );
    if (matched) {
      setSelectedId(matched.id);
    } else {
      setSelectedId(paramKey);
    }
  }, [paramKey, patients]);

  // Realtime Listener ฟังการเปลี่ยนแปลงในตาราง patients และ deleted_patients
  useEffect(() => {
    const channel = supabase
      .channel("live-patients-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patients",
        },
        () => fetchPatients()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deleted_patients",
        },
        () => fetchPatients()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPatients]);

  const patient = useMemo(() => {
    const found = patients.find(
      (item) =>
        item.id === selectedId ||
        item.raw_db_id === selectedId ||
        item.hn === selectedId
    );

    if (!found) {
      return patients.length > 0 ? patients[0] : null;
    }

    const finalLevel = evaluateLevelFromHR(found.hr, found.level);
    const style = getLevelStyle(finalLevel);

    return {
      ...found,
      level: finalLevel,
      color: style.color,
      bg: style.bg,
      border: style.border,
    };
  }, [patients, selectedId]);

  const [loadingAI, setLoadingAI] = useState(false);
  const [result, setResult] = useState<Patient | null>(null);

  useEffect(() => {
    setResult(null);
  }, [selectedId]);

  const runAI = () => {
    if (!patient) return;

    setLoadingAI(true);
    setTimeout(() => {
      setLoadingAI(false);
      setResult(patient);
    }, 1200);
  };

  if (loadingPatients && patients.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={{ marginTop: 10, color: "#64748b", fontSize: 13 }}>
          กำลังโหลดข้อมูลผู้ป่วย...
        </Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#0f172a" }}>
          ไม่พบข้อมูลผู้ป่วย
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 15,
            backgroundColor: "#0284c7",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold" }}>กลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const oldImage = getOldPatientImage(patient.id);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 16,
      }}
    >
      {/* Quick Switcher */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "bold",
            color: "#64748b",
            marginBottom: 6,
          }}
        >
          เลือกผู้ป่วย:
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {patients.map((item, index) => {
            const isSelected = item.id === patient.id;

            return (
              <TouchableOpacity
                key={`tab-${item.id}-${index}`}
                onPress={() => setSelectedId(item.id)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: isSelected ? item.color : "#e2e8f0",
                }}
              >
                <Text
                  style={{
                    color: isSelected ? "#ffffff" : "#334155",
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Header Profile */}
      <View style={S.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[S.badge, { backgroundColor: patient.color }]}>
              {patient.id}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginTop: 2 }}>
              {patient.name}
            </Text>
            <Text style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
              {patient.gender} • {patient.age} ปี
            </Text>
            <Text style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>
              {patient.hn}
            </Text>
          </View>

          <Text style={{ color: patient.color, fontWeight: "bold", fontSize: 12 }}>
            {patient.level === "EMERGENCY" ? "🚨 EMERGENCY" : "● LIVE"}
          </Text>
        </View>
      </View>

      {/* Vitals Grid */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <VitalBox
          label="HEART RATE"
          value={patient.hr ?? "--"}
          unit="BPM"
          color={patient.color}
        />
        <VitalBox
          label="SpO2"
          value={
            patient.spo2 !== null && patient.spo2 !== undefined
              ? `${patient.spo2}%`
              : "--"
          }
          unit="O2 Sat"
          color={
            patient.spo2 !== null && patient.spo2 < 90 ? "#dc2626" : "#2563eb"
          }
        />
        <VitalBox
          label="BP"
          value={patient.bp ?? "--"}
          unit="mmHg"
          color={patient.level === "EMERGENCY" ? "#dc2626" : "#16a34a"}
        />
      </View>

      {/* ECG Image Card */}
      <View style={S.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#0284c7", fontWeight: "bold" }}>
            ⚡ LEAD II ECG WAVEFORM ({patient.id})
          </Text>
          {(oldImage || patient.ecg_image) && (
            <Text style={{ fontSize: 11, color: "#64748b" }}>
              🔍 แตะเพื่อซูมขยาย
            </Text>
          )}
        </View>

        {/* แตะรูปเพื่อเปิด Modal ดูภาพขยาย */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (oldImage || patient.ecg_image) {
              setIsModalVisible(true);
            }
          }}
          style={S.imgBox}
        >
          {oldImage ? (
            <Image
              key={patient.id}
              source={oldImage}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="contain"
            />
          ) : patient.ecg_image ? (
            <Image
              key={patient.ecg_image}
              source={{ uri: patient.ecg_image }}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="contain"
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: "#22c55e",
                  fontSize: 12,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                📈 [ ECG Waveform Signal - {patient.id} ]
              </Text>
              <Text
                style={{
                  color: "#94a3b8",
                  fontSize: 10,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                ยังไม่มี ECG Image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ECG Status */}
        <View
          style={{
            marginTop: 10,
            backgroundColor: patient.bg,
            borderColor: patient.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
          }}
        >
          <Text style={{ color: patient.color, fontWeight: "bold", fontSize: 13 }}>
            ECG Status
          </Text>
          <Text style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>
            {patient.status}
          </Text>
        </View>
      </View>

      {/* AI Diagnosis */}
      <View style={S.card}>
        <Text style={{ color: "#0f172a", fontWeight: "bold", marginBottom: 8 }}>
          🤖 AI DIAGNOSIS
        </Text>

        {result ? (
          <View
            style={[
              S.resBox,
              {
                borderColor: result.border,
                backgroundColor: result.bg,
              },
            ]}
          >
            <Text style={{ color: result.color, fontWeight: "bold", fontSize: 15 }}>
              {result.level}: {result.status}
            </Text>

            {result.conf !== null && result.conf !== undefined ? (
              <Text style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>
                Confidence: {result.conf}%
              </Text>
            ) : (
              <Text style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                ยังไม่มีค่า AI Confidence จากฐานข้อมูล
              </Text>
            )}
          </View>
        ) : (
          <Text style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
            กดปุ่มด้านล่างเพื่อเริ่ม ประมวลผลสัญญาณ ECG ด้วย AI
          </Text>
        )}

        <TouchableOpacity
          style={[S.btnPrimary, { backgroundColor: patient.color }]}
          onPress={runAI}
          disabled={loadingAI}
        >
          {loadingAI ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={S.btnText}>RUN AI DIAGNOSIS</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Patient History */}
      <TouchableOpacity
        style={S.btnSecondary}
        onPress={() =>
          router.push({
            pathname: "/history",
            params: { patientId: patient.id },
          })
        }
      >
        <Text style={S.btnSecondaryText}>
          📋 ดูประวัติย้อนหลัง (PATIENT HISTORY) ➔
        </Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <View style={S.disclaimerBox}>
        <Text style={S.disclaimerTitle}>
          ⚠️ ข้อตกลงและคำชี้แจงสิทธิ์ (Disclaimer)
        </Text>
        <Text style={S.disclaimerText}>
          แอปพลิเคชันนี้เป็นเพียงระบบต้นแบบ (Prototype)
          เพื่อการศึกษาและการวิจัยเท่านั้น ไม่ได้เป็นอุปกรณ์หรือเครื่องมือทางการแพทย์
          สำหรับใช้ในการวินิจฉัย ประเมิน หรือรักษาโรคจริง
          ห้ามนำข้อมูลในระบบไปใช้ทดแทนการตัดสินใจ หรือการรักษาพยาบาลโดยแพทย์เด็ดขาด
        </Text>
      </View>

      <View style={{ height: 30 }} />

      {/* Modal แสดงรูป ECG แบบซูมขยายได้ */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={S.modalContainer}>
          <TouchableOpacity
            style={S.modalCloseButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={S.modalCloseText}>✕ ปิด</Text>
          </TouchableOpacity>

          <Text style={S.modalHintText}>🤏 จีบนิ้วเพื่อขยายรูปภาพ</Text>

          <ScrollView
            style={S.modalScrollView}
            contentContainerStyle={S.zoomScrollViewContent}
            maximumZoomScale={5}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bouncesZoom={true}
            centerContent={true}
          >
            {oldImage ? (
              <Image
                source={oldImage}
                style={S.fullEcgImage}
                resizeMode="contain"
              />
            ) : patient.ecg_image ? (
              <Image
                source={{ uri: patient.ecg_image }}
                style={S.fullEcgImage}
                resizeMode="contain"
              />
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

// =====================================================
// STYLES
// =====================================================

const S = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  badge: {
    alignSelf: "flex-start",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  imgBox: {
    width: "100%",
    height: 180,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  btnPrimary: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
  btnSecondary: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  btnSecondaryText: {
    color: "#334155",
    fontWeight: "bold",
    fontSize: 12,
  },
  disclaimerBox: {
    padding: 10,
    backgroundColor: "#fffbe2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fef08a",
  },
  disclaimerTitle: {
    color: "#854d0e",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  disclaimerText: {
    color: "#a16207",
    fontSize: 10,
    lineHeight: 14,
  },

  // Modal Zoom Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 999,
  },
  modalCloseText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalHintText: {
    position: "absolute",
    bottom: 40,
    color: "#94a3b8",
    fontSize: 12,
    zIndex: 999,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalScrollView: {
    width: "100%",
    height: "100%",
  },
  zoomScrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullEcgImage: {
    width: "100%",
    height: "80%",
    minWidth: 350,
    minHeight: 350,
  },
});