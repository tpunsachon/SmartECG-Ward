import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const PATIENTS_SUMMARY = [
  {
    id: "PT1",
    name: "กรองแก้ว บุญมี",
    age: 62,
    gender: "หญิง",
    status: "AFib Detected",
    level: "CRITICAL",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
    image: require("../../assets/images/afib.jpg"),
  },
  {
    id: "PT2",
    name: "วรรณรสา อรุณรัศมิ์",
    age: 58,
    gender: "หญิง",
    status: "LVH Detected",
    level: "WARNING",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    image: require("../../assets/images/lvh.jpg"),
  },
  {
    id: "PT3",
    name: "พุฒิภัทร จุฑาเทพ",
    age: 45,
    gender: "ชาย",
    status: "Normal Sinus Rhythm",
    level: "NORMAL",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
    image: require("../../assets/images/normal.jpg"),
  },
  {
    id: "PT4",
    name: "มารตี เทวพรหม",
    age: 67,
    gender: "หญิง",
    status: "Ventricular Fibrillation (VFib)",
    level: "EMERGENCY",
    color: "#991b1b",
    bg: "#ffe4e6",
    border: "#f87171",
    image: require("../../assets/images/vfib.jpg"),
  },
];

export default function SummaryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>
        สรุปภาพรวมคลื่นไฟฟ้าหัวใจ (ECG Summary Overview)
      </Text>

      {PATIENTS_SUMMARY.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            { borderColor: item.border, borderLeftColor: item.color },
          ]}
        >
          {/* ส่วนข้อมูลคนไข้ */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.badge, { backgroundColor: item.color }]}>
                {item.id} • {item.level}
              </Text>
              <Text style={styles.patientName}>{item.name}</Text>
              <Text style={styles.patientSub}>
                {item.gender} • {item.age} ปี
              </Text>
            </View>
            <Text style={[styles.statusText, { color: item.color }]}>
              {item.status}
            </Text>
          </View>

          {/* ส่วนแสดงรูปกราฟ ECG */}
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={styles.ecgImage}
              resizeMode="cover"
            />
          </View>
        </View>
      ))}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>
          ⚠️ ข้อตกลงและคำชี้แจงสิทธิ์ (Disclaimer)
        </Text>
        <Text style={styles.disclaimerText}>
          แอปพลิเคชันนี้เป็นเพียงระบบต้นแบบ (Prototype)
          เพื่อการศึกษาและการวิจัยเท่านั้น
          ไม่ได้เป็นอุปกรณ์หรือเครื่องมือทางการแพทย์สำหรับใช้ในการวินิจฉัย
          ประเมิน หรือรักษาโรคจริง
          ห้ามนำข้อมูลในระบบไปใช้ทดแทนการตัดสินใจหรือการรักษาพยาบาลโดยแพทย์เด็ดขาด
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  badge: {
    color: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  patientName: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  patientSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  statusText: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 8,
  },
  imageContainer: {
    height: 140,
    width: "100%",
    backgroundColor: "#020617",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  ecgImage: { width: "100%", height: "100%" },

  /* Disclaimer Box Style */
  disclaimerBox: {
    marginTop: 0,
    padding: 12,
    backgroundColor: "#fffbe2", // 🎨 พื้นหลังสีเหลือง/ส้มอ่อนเตือนความคุ้มครอง
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fef08a",
  },
  disclaimerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#854d0e",
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 10,
    color: "#a16207",
    lineHeight: 15,
  },
});
