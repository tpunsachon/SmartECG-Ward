import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

// =====================================================
// ลำดับความสำคัญของระดับความรุนแรง
// =====================================================
const LEVEL_PRIORITY: Record<string, number> = {
  EMERGENCY: 1,
  CRITICAL: 2,
  WARNING: 3,
  NORMAL: 4,
};

// Map รูปภาพจาก assets/images ตามโรค / Level
const IMAGE_BY_LEVEL: Record<string, any> = {
  EMERGENCY: require("../../assets/images/vfib.jpg"),
  CRITICAL: require("../../assets/images/afib.jpg"),
  WARNING: require("../../assets/images/lvh.jpg"),
  NORMAL: require("../../assets/images/normal.jpg"),
};

// =====================================================
// ผู้ป่วยเก่า (Mock Data)
// =====================================================

const OLD_PATIENTS = [
  {
    id: "PT4",
    name: "มารตี เทวพรหม",
    age: 67,
    gender: "หญิง",
    status: "Ventricular Fibrillation (VFib)",
    level: "EMERGENCY",
    image: require("../../assets/images/vfib.jpg"),
    color: "#991b1b",
    bg: "#ffe4e6",
    border: "#f87171",
  },
  {
    id: "PT1",
    name: "กรองแก้ว บุญมี",
    age: 62,
    gender: "หญิง",
    status: "AFib Detected",
    level: "CRITICAL",
    image: require("../../assets/images/afib.jpg"),
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
  {
    id: "PT2",
    name: "วรรณรสา อรุณรัศมิ์",
    age: 58,
    gender: "หญิง",
    status: "LVH Detected",
    level: "WARNING",
    image: require("../../assets/images/lvh.jpg"),
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    id: "PT3",
    name: "พุฒิภัทร จุฑาเทพ",
    age: 45,
    gender: "ชาย",
    status: "Normal Sinus Rhythm",
    level: "NORMAL",
    image: require("../../assets/images/normal.jpg"),
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
  },
  {
    id: "PT5",
    name: "รณ นภาลัย",
    age: 32,
    gender: "ชาย",
    status: "Normal Sinus Rhythm",
    level: "NORMAL",
    image: require("../../assets/images/normal.jpg"),
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
  },
];

// =====================================================
// Type ผู้ป่วย
// =====================================================

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: string;
  level: string;
  color: string;
  bg: string;
  border: string;
  image?: any;
  created_at?: string;
};

// =====================================================
// สีตาม Level
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
// Summary Screen
// =====================================================

export default function SummaryScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // ดึงข้อมูลผู้ป่วยจาก Supabase
  // ===================================================

  const fetchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          id,
          name,
          age,
          gender,
          level,
          status,
          created_at
        `
        )
        .order("created_at", { ascending: true });

      const { data: deletedData } = await supabase
        .from("deleted_patients")
        .select("patient_id");

      const deletedIds = new Set(
        (deletedData || []).map((item: any) => String(item.patient_id))
      );

      if (error) {
        console.error("Summary fetch error:", error);
        const activeOldPatients = (OLD_PATIENTS as Patient[])
          .filter((p) => !deletedIds.has(p.id))
          .sort((a, b) => (LEVEL_PRIORITY[a.level] || 99) - (LEVEL_PRIORITY[b.level] || 99));
        setPatients(activeOldPatients);
        return;
      }

      const databasePatients: Patient[] = (data || []).map((item: any) => {
        const level = String(item.level || "NORMAL").toUpperCase();
        const style = getLevelStyle(level);

        return {
          id: String(item.id),
          name: String(item.name || "-"),
          age: Number(item.age || 0),
          gender: String(item.gender || "-"),
          status: String(item.status || "Normal Sinus Rhythm"),
          level,
          color: style.color,
          bg: style.bg,
          border: style.border,
          image: IMAGE_BY_LEVEL[level] || IMAGE_BY_LEVEL.NORMAL,
          created_at: item.created_at,
        };
      });

      const dbIds = new Set(databasePatients.map((p) => p.id));

      const activeOldPatients = (OLD_PATIENTS as Patient[]).filter(
        (p) => !deletedIds.has(p.id) && !dbIds.has(p.id)
      );

      const allPatients: Patient[] = [
        ...activeOldPatients,
        ...databasePatients,
      ]
        .filter((p) => !deletedIds.has(p.id))
        .sort((a, b) => (LEVEL_PRIORITY[a.level] || 99) - (LEVEL_PRIORITY[b.level] || 99));

      setPatients(allPatients);
    } catch (error) {
      console.error("Summary exception:", error);
      const activeOldPatients = (OLD_PATIENTS as Patient[])
        .filter((p) => p.id)
        .sort((a, b) => (LEVEL_PRIORITY[a.level] || 99) - (LEVEL_PRIORITY[b.level] || 99));
      setPatients(activeOldPatients);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [fetchPatients])
  );

  useEffect(() => {
    const channel = supabase
      .channel("summary-patients-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => fetchPatients()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deleted_patients" },
        () => fetchPatients()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPatients]);

  if (loading && patients.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.patientCount}>
          ผู้ป่วยทั้งหมด {patients.length} คน
        </Text>

        {patients.map((patient, index) => {
          return (
            <View
              key={`summary-pt-${patient.id}-${index}`}
              style={[
                styles.patientCard,
                {
                  borderLeftColor: patient.color,
                },
              ]}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: patient.color,
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{patient.level}</Text>
                </View>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.ecgStatusText,
                    {
                      color: patient.color,
                    },
                  ]}
                >
                  {patient.status}
                </Text>
              </View>

              {/* Patient Name */}
              <Text style={styles.patientName}>{patient.name}</Text>

              {/* Gender + Age */}
              <Text style={styles.patientInfo}>
                {patient.gender}
                {" • "}
                {patient.age} ปี
              </Text>

              {/* ECG Image (ปรับให้พอดีกรอบ) */}
              <View style={styles.imageContainer}>
                <Image
                  source={patient.image || require("../../assets/images/normal.jpg")}
                  style={styles.ecgImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          );
        })}

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            แอปพลิเคชันนี้เป็นเพียงระบบต้นแบบ (Prototype)
            เพื่อการศึกษาและการวิจัยเท่านั้น
            ไม่ได้เป็นอุปกรณ์หรือเครื่องมือทางการแพทย์ สำหรับใช้ในการวินิจฉัย
            ประเมิน หรือรักษาโรคจริง
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  patientCount: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
  },

  patientCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderLeftWidth: 5,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },

  ecgStatusText: {
    fontSize: 12,
    fontWeight: "bold",
    maxWidth: "60%",
  },

  patientName: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 2,
  },

  patientInfo: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 1,
    marginBottom: 6,
  },

  // ปรับแก้ขนาดและสัดส่วนกรอบภาพตรงนี้
  imageContainer: {
    width: "100%",
    height: 135,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  ecgImage: {
    width: "100%",
    height: "100%",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 8,
  },

  disclaimerBox: {
    marginTop: 6,
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
});