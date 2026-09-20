import { useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const PATIENTS = [
  {
    id: "PT1",
    hn: "HN 66-04912",
    name: "กรองแก้ว บุญมี",
    age: 62,
    gender: "หญิง",
    hr: 112,
    bp: "138/88",
    status: "AFib Detected",
    level: "CRITICAL",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    id: "PT2",
    hn: "HN 65-11084",
    name: "วรรณรสา อรุณรัศมิ์",
    age: 58,
    gender: "หญิง",
    hr: 88,
    bp: "145/92",
    status: "LVH Detected",
    level: "WARNING",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    id: "PT3",
    hn: "HN 67-00129",
    name: "พุฒิภัทร จุฑาเทพ",
    age: 45,
    gender: "ชาย",
    hr: 72,
    bp: "120/80",
    status: "Normal Sinus Rhythm",
    level: "NORMAL",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    id: "PT4",
    hn: "HN 64-08821",
    name: "มารตี เทวพรหม",
    age: 67,
    gender: "หญิง",
    hr: 185,
    bp: "90/60",
    status: "Ventricular Fibrillation (VFib)",
    level: "EMERGENCY",
    color: "#991b1b",
    bg: "#ffe4e6",
  },
];

export default function OverviewScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc", padding: 16 }}>
      {/* Header Overview */}
      <View style={S.card}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a" }}>
          🏥 Patient Monitoring Ward
        </Text>
        <Text style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          ระบบเฝ้าระวังคลื่นไฟฟ้าหัวใจและสถานะผู้ป่วย Real-time
        </Text>
      </View>

      <Text
        style={{
          fontSize: 15,
          fontWeight: "bold",
          color: "#0f172a",
          marginBottom: 10,
        }}
      >
        👥 รายชื่อผู้ป่วยในความดูแล ({PATIENTS.length} คน)
      </Text>

      {/* Patient Cards List */}
      {PATIENTS.map((p) => (
        <View
          key={p.id}
          style={[
            S.card,
            { backgroundColor: p.bg, borderColor: p.color + "40" },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <Text style={[S.badge, { backgroundColor: p.color }]}>
                  {p.id}
                </Text>
                <Text
                  style={{ fontSize: 11, fontWeight: "bold", color: "#64748b" }}
                >
                  {p.hn}
                </Text>
              </View>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#0f172a" }}
              >
                {p.name}
              </Text>
              <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                {p.gender} • {p.age} ปี
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: p.color,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                {p.level}
              </Text>
              <Text
                style={{
                  color: p.color,
                  fontWeight: "bold",
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                HR: {p.hr} BPM
              </Text>
              <Text style={{ color: "#64748b", fontSize: 11 }}>BP: {p.bp}</Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderColor: "#e2e8f0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "bold", color: p.color }}>
              ● {p.status}
            </Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[S.actionBtn, { backgroundColor: p.color }]}
                onPress={() =>
                  router.push({
                    pathname: "/live",
                    params: { patientId: p.id },
                  })
                }
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}
                >
                  ⚡ LIVE
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[S.actionBtn, { backgroundColor: "#475569" }]}
                onPress={() =>
                  router.push({
                    pathname: "/history",
                    params: { patientId: p.id },
                  })
                }
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}
                >
                  📋 HISTORY
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const S = {
  card: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  badge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold" as const,
  },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
};
