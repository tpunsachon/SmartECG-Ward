import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

// ============================================================================
// 1. CONSTANTS & MOCK DATA
// ============================================================================
const LEVEL_PRIORITY: Record<string, number> = {
  EMERGENCY: 1,
  CRITICAL: 2,
  WARNING: 3,
  NORMAL: 4,
};

const PATIENT_HISTORY: Record<string, any> = {
  PT1: {
    name: "กรองแก้ว บุญมี",
    age: 62,
    gender: "หญิง",
    hn: "HN 66-04912",
    diag: "Paroxysmal Atrial Fibrillation with Rapid Ventricular Response (RVR)",
    chads: "CHA₂DS₂-VASc Score = 3 (Age, Sex, Hypertension)",
    logs: [
      {
        date: "19 ก.ย. 2026 • 08:30 น. (Emergency Department)",
        vitals: "HR 112 BPM (Irregular) | SpO2 96% (RA) | BP 138/88 mmHg | RR 22/min | T 36.8°C",
        lab: "K+ 3.8 mEq/L | Mg2+ 1.9 mg/dL | High-Sensitivity Troponin-I: < 0.01 ng/mL (Negative)",
        ecgDetail: "Lead II: Absence of P waves, replaced by fibrillatory waves (f-waves), irregularly irregular QRS complexes (R-R interval varies). Average HR ~112 BPM.",
        status: "Atrial Fibrillation with RVR",
        conf: 96.8,
        level: "CRITICAL",
        color: "#dc2626",
        pathoNote: "เกิดจาก Ectopic foci บริเวณ Pulmonary veins ยิงกระแสไฟฟ้าถี่รวดเร็ว ชนกับ Reentry circuits ในหัวใจห้องบน ทำให้ AV Node ไม่สามารถกรองสัญญาณได้ทัน ส่งผลให้ Ventricular rate ไวเกินกำหนด",
        plan: "1. Rate Control: Diltiazem 15 mg IV bolus over 2 min\n2. Anticoagulation: Start Apixaban (Eliquis) 5 mg PO BID (เนื่องจาก CHA₂DS₂-VASc = 3)\n3. Monitor telemetry CONTINUOUSLY",
      },
    ],
  },
  PT2: {
    name: "มารตี เทวพรหม",
    age: 67,
    gender: "หญิง",
    hn: "HN 64-08821",
    diag: "Acute Anterior Wall STEMI leading to Ventricular Fibrillation (Cardiac Arrest)",
    chads: "TIMI Risk Score = 11/14 (High Risk / Critical)",
    logs: [
      {
        date: "19 ก.ย. 2026 • 09:55 น. (ER Resuscitation Room - CPR in progress)",
        vitals: "HR ~185 BPM (Unmeasurable pulse) | SpO2 Unmeasurable | BP Unmeasurable (0/0) | RR Apneic",
        lab: "hs-Troponin T: 3,450 ng/L (Critical High) | K+: 3.1 mEq/L (Hypokalemia) | Arterial Blood Gas: Severe Metabolic Acidosis (pH 7.12, HCO3- 12)",
        ecgDetail: "Lead II: Chaotic, irregular, coarse wave form with varying amplitude and shape. Complete absence of identifiable P, QRS, or T waves (VFib).",
        status: "Ventricular Fibrillation (VFib)",
        conf: 98.9,
        level: "EMERGENCY",
        color: "#991b1b",
        pathoNote: "เกิดจาก Ischemia เฉียบพลันบริเวณกล้ามเนื้อหัวใจห้องซ้ายล่าง (LAD occlusion) ร่วมกับภาวะ Hypokalemia ส่งผลให้เกิด Reentry circuits ขนาดย่อยๆ กระจายทั่วห้องหัวใจล่าง ไม่อาจสูบฉีดเลือดไปเลี้ยงร่างกายได้เลย (Cardiac Arrest)",
        plan: "🚨 HIGH PRIORITY CODE RED ACTION:\n1. Immediate Unsynchronized Defibrillation (Biphasic 200 Joules)\n2. High-quality CPR (100-120 compressions/min)\n3. Epinephrine 1 mg IV q 3-5 min + Amiodarone 300 mg IV Push\n4. Prepare for Emergency Primary PCI (Cath Lab) post-ROSC",
      },
    ],
  },
  PT3: {
    name: "พุฒิภัทร จุฑาเทพ",
    age: 45,
    gender: "ชาย",
    hn: "HN 67-00129",
    diag: "Normal Cardiac Conduction & Healthy Cardiovascular Status",
    chads: "Cardiovascular Risk Assessment = Low Risk (< 1%)",
    logs: [
      {
        date: "19 ก.ย. 2026 • 07:45 น. (Executive Health Center)",
        vitals: "HR 72 BPM | SpO2 99% (RA) | BP 120/80 mmHg | RR 16/min | T 36.5°C",
        lab: "Fasting Plasma Glucose: 92 mg/dL | HbA1c: 5.3% | Total Cholesterol: 178 mg/dL",
        ecgDetail: "Normal Sinus Rhythm. P wave upright in II, III, aVF. PR interval 0.16s, QRS duration 0.08s, QTc 410ms. No ST-T changes.",
        status: "Normal Sinus Rhythm",
        conf: 99.1,
        level: "NORMAL",
        color: "#16a34a",
        pathoNote: "ระบบนำไฟฟ้าของหัวใจสมบูรณ์ สัญญาณจาก SA Node วิ่งผ่าน Atria, AV Node, Bundle of His และ Purkinje fibers ตามลำดับเวลามาตรฐาน",
        plan: "ให้คำแนะนำการส่งเสริมสุขภาพ (Primary Prevention) และตรวจสุขภาพประจำปีตามปกติ",
      },
    ],
  },
  PT4: {
    name: "วรรณรสา อรุณรัศมิ์",
    age: 58,
    gender: "หญิง",
    hn: "HN 65-11084",
    diag: "Hypertensive Heart Disease with Left Ventricular Hypertrophy (LVH)",
    chads: "Echocardiogram: LVM Index = 124 g/m² (Concentric LVH)",
    logs: [
      {
        date: "19 ก.ย. 2026 • 09:10 น. (Hypertension Excellence Clinic)",
        vitals: "HR 88 BPM | SpO2 98% | BP 145/92 mmHg | RR 18/min",
        lab: "Sokolow-Lyon Voltage: S_V1 + R_V5 = 39 mm (>35 mm) | Cornell Voltage = 24 mm",
        ecgDetail: "High voltage QRS, ST-segment depression with T-wave inversion in Lead I, aVL, V5, V6 (Left Ventricular Strain Pattern)",
        status: "LVH with Strain Pattern",
        conf: 92.4,
        level: "WARNING",
        color: "#d97706",
        pathoNote: "เกิดจาก Chronic Afterload Overload จากโรคความดันโลหิตสูง ทำให้เซลล์กล้ามเนื้อหัวใจห้องซ้ายล่าง (Cardiomyocytes) เพิ่มขนาดความหนา (Hypertrophy) เพื่อลด Wall Stress ส่งผลให้เกิดภาวะ subendocardial ischemia (Strain pattern)",
        plan: "1. Up-titrate ACEI/ARB: Enalapril 10 mg 1x2 PO\n2. Add Calcium Channel Blocker: Amlodipine 5 mg PO OD\n3. Target BP < 130/80 mmHg เพื่อชะลอ LV Remodeling",
      },
    ],
  },
};

const OLD_PATIENTS: Record<string, any> = {
  PT1: { id: "PT1", name: "กรองแก้ว บุญมี", age: 62, gender: "หญิง", hr: 112, spo2: 96, bp: "138/88", status: "AFib Detected", conf: 96.8, level: "CRITICAL", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
  PT2: { id: "PT2", name: "มารตี เทวพรหม", age: 67, gender: "หญิง", hr: 185, spo2: 89, bp: "90/60", status: "Ventricular Fibrillation (VFib)", conf: 98.9, level: "EMERGENCY", color: "#991b1b", bg: "#ffe4e6", border: "#f87171" },
  PT3: { id: "PT3", name: "พุฒิภัทร จุฑาเทพ", age: 45, gender: "ชาย", hr: 72, spo2: 99, bp: "120/80", status: "Normal Sinus Rhythm", conf: 99.1, level: "NORMAL", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
  PT4: { id: "PT4", name: "วรรณรสา อรุณรัศมิ์", age: 58, gender: "หญิง", hr: 88, spo2: 98, bp: "145/92", status: "LVH Detected", conf: 92.4, level: "WARNING", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  PT5: { id: "PT5", name: "รณพีร์ จุฑาเทพ", age: 32, gender: "ชาย", hr: 75, spo2: 99, bp: "120/80", status: "Normal Sinus Rhythm", conf: 99.0, level: "NORMAL", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
};

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================
const getOldPatientImage = (key: string) => {
  try {
    switch (key) {
      case "PT1": return require("../../assets/images/afib.jpg");
      case "PT2": return require("../../assets/images/vfib.jpg");
      case "PT3": return require("../../assets/images/normal.jpg");
      case "PT4": return require("../../assets/images/lvh.jpg");
      case "PT5": return require("../../assets/images/normal.jpg");
      default: return null;
    }
  } catch (e) {
    return null;
  }
};

const getLevelStyle = (level: string) => {
  const value = String(level || "NORMAL").toUpperCase();
  switch (value) {
    case "EMERGENCY": return { color: "#991b1b", bg: "#ffe4e6", border: "#f87171" };
    case "CRITICAL": return { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" };
    case "WARNING": return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
    default: return { color: "#16a34a", bg: "#f0fdf4", border: "#86efac" };
  }
};

const evaluateLevelFromHR = (hr: number | null, defaultLevel: string) => {
  if (hr === null || hr === undefined || Number.isNaN(hr)) {
    return String(defaultLevel || "NORMAL").toUpperCase();
  }
  if (hr >= 140 || hr <= 40) return "EMERGENCY";
  if (hr > 100 || hr < 50) return "CRITICAL";
  if (hr < 60) return "WARNING";
  return "NORMAL";
};

type Patient = {
  id: string;
  displayId?: string;
  raw_db_id?: string;
  hn?: string;
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

const VitalBox = ({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) => (
  <View style={[S.card, { flex: 1, alignItems: "center", padding: 8, marginBottom: 0 }]}>
    <Text style={{ color: "#64748b", fontSize: 9, fontWeight: "bold" }}>{label}</Text>
    <Text style={{ color, fontSize: 18, fontWeight: "bold", marginVertical: 2 }}>{value}</Text>
    <Text style={{ color: "#94a3b8", fontSize: 9 }}>{unit}</Text>
  </View>
);

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================
export default function LiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | number | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const rawId = params.patientId || params.id;
  const paramKey = String(Array.isArray(rawId) ? rawId[0] : rawId || "").trim();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string>(paramKey || "PT2");
  const [loadingPatients, setLoadingPatients] = useState(true);

  const loadDeletedLocalIds = async () => {
    try {
      const saved = await AsyncStorage.getItem("DELETED_PATIENT_IDS");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const fetchPatients = useCallback(async () => {
    try {
      setLoadingPatients(true);
      const deletedIds = await loadDeletedLocalIds();

      const { data, error } = await supabase
        .from("patients")
        .select(`id, name, age, gender, hr, spo2, bp, level, status, ecg_image, created_at`);

      if (error) {
        console.error("Fetch Live Patients Error:", error);
        const oldPatients = Object.values(OLD_PATIENTS)
          .map((item: any): Patient => ({ ...item, displayId: item.id }))
          .filter((item) => !deletedIds.includes(item.id));
        setPatients(oldPatients);
        return;
      }

      let dbIndex = 6;
      const databasePatients: Patient[] = (data || []).map((item: any) => {
        const level = String(item.level || "NORMAL").toUpperCase();
        const style = getLevelStyle(level);

        return {
          id: String(item.id),
          displayId: `PT${dbIndex++}`,
          raw_db_id: String(item.id || ""),
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

      const dbIds = new Set(databasePatients.map((p) => p.id));
      const dbNames = new Set(databasePatients.map((p) => p.name.trim()));

      const oldPatientsList = Object.values(OLD_PATIENTS)
        .filter(
          (item: any) =>
            !deletedIds.includes(item.id) &&
            !dbIds.has(item.id) &&
            !dbNames.has(item.name.trim())
        )
        .map((item: any) => ({ ...item, displayId: item.id }));

      let allPatients = [...oldPatientsList, ...databasePatients].filter(
        (p) => !deletedIds.includes(p.id)
      );

      allPatients.sort((a, b) => {
        const levelA = evaluateLevelFromHR(a.hr, a.level);
        const levelB = evaluateLevelFromHR(b.hr, b.level);
        const priorityA = LEVEL_PRIORITY[levelA] || 99;
        const priorityB = LEVEL_PRIORITY[levelB] || 99;

        if (priorityA !== priorityB) return priorityA - priorityB;
        return (b.hr || 0) - (a.hr || 0);
      });

      setPatients(allPatients);

      if (paramKey) {
        const matched = allPatients.find(
          (p) => p.id === paramKey || p.raw_db_id === paramKey || p.displayId === paramKey
        );
        if (matched) setSelectedId(matched.id);
      } else if (allPatients.length > 0) {
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

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [fetchPatients])
  );

  useEffect(() => {
    if (!paramKey) return;
    const matched = patients.find(
      (p) => p.id === paramKey || p.raw_db_id === paramKey || p.displayId === paramKey
    );
    if (matched) setSelectedId(matched.id);
    else setSelectedId(paramKey);
  }, [paramKey, patients]);

  useEffect(() => {
    const channel = supabase
      .channel("live-patients-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () => fetchPatients())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPatients]);

  const patient = useMemo(() => {
    const found = patients.find(
      (item) => item.id === selectedId || item.raw_db_id === selectedId || item.displayId === selectedId
    );

    if (!found) return patients.length > 0 ? patients[0] : null;

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

  // --------------------------------------------------------------------------
  // EXPORT PDF FUNCTION (ระบบดึง History แบบ Multi-Source)
  // --------------------------------------------------------------------------
  const exportToPDF = async () => {
    if (!patient) return;

    try {
      setExportingPdf(true);
      const currentTime = new Date().toLocaleString("th-TH");
      const currentPatientId = patient.raw_db_id || patient.id;
      const currentPatientDisplayId = patient.displayId || patient.id;

      let historyLogs: any[] = [];
      let ptInfo = {
        name: patient.name,
        hn: patient.hn || `HN-${currentPatientDisplayId}`,
        gender: patient.gender,
        age: patient.age,
        diag: patient.status,
        chads: "-",
      };

      const candidateKeys = [
        currentPatientDisplayId,
        currentPatientId,
        patient.id,
        patient.name.trim(),
      ].filter(Boolean);

      // --- SOURCE 1: PATIENT_HISTORY Constant ---
      let matchedHistoryKey = candidateKeys.find((k) => PATIENT_HISTORY[k]);
      if (matchedHistoryKey && PATIENT_HISTORY[matchedHistoryKey]) {
        const localPt = PATIENT_HISTORY[matchedHistoryKey];
        ptInfo = {
          name: localPt.name || patient.name,
          hn: localPt.hn || ptInfo.hn,
          gender: localPt.gender || patient.gender,
          age: localPt.age || patient.age,
          diag: localPt.diag || patient.status,
          chads: localPt.chads || "-",
        };

        if (localPt.logs && localPt.logs.length > 0) {
          historyLogs = localPt.logs.map((log: any) => ({
            date: log.date || "-",
            vitals: log.vitals || "-",
            lab: log.lab || "-",
            ecgDetail: log.ecgDetail || "-",
            status: log.status || "-",
            conf: log.conf || "-",
            level: log.level || "NORMAL",
            color: log.color || "#16a34a",
            pathoNote: log.pathoNote || "-",
            plan: log.plan || "-",
          }));
        }
      }

      // --- SOURCE 2: Supabase Database ---
      try {
        const { data: dbRecords, error: dbErr } = await supabase
          .from("ecg_records")
          .select("*")
          .or(`patient_id.eq.${currentPatientId},patient_code.eq.${currentPatientDisplayId}`);

        if (!dbErr && dbRecords && dbRecords.length > 0) {
          const dbLogs = dbRecords.map((rec: any) => ({
            date: rec.created_at ? new Date(rec.created_at).toLocaleString("th-TH") : "-",
            vitals: `HR ${rec.hr ?? "--"} BPM | SpO2 ${rec.spo2 ? `${rec.spo2}%` : "--"} | BP ${rec.bp ?? "--"}`,
            lab: rec.lab_result || rec.lab || "-",
            ecgDetail: rec.ecg_detail || rec.prediction_result || rec.notes || "-",
            status: rec.status || rec.prediction_result || "Normal",
            conf: rec.confidence || rec.accuracy || "-",
            level: rec.level || "NORMAL",
            color: rec.level === "EMERGENCY" ? "#991b1b" : rec.level === "CRITICAL" ? "#dc2626" : rec.level === "WARNING" ? "#d97706" : "#16a34a",
            pathoNote: rec.patho_note || rec.pathophysiology || "-",
            plan: rec.plan || rec.treatment_plan || "-",
          }));

          historyLogs = [...historyLogs, ...dbLogs];
        }
      } catch (err) {
        console.log("Supabase history lookup fallback:", err);
      }

      // --- SOURCE 3: AsyncStorage Local Cache ---
      try {
        const savedHistory = await AsyncStorage.getItem("PATIENT_HISTORY_LOGS");
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          const matchedLocal = parsed.filter((log: any) =>
            candidateKeys.includes(log.patientId) || candidateKeys.includes(log.patient_id)
          );

          if (matchedLocal.length > 0) {
            const localLogs = matchedLocal.map((log: any) => ({
              date: log.timestamp || log.date || "-",
              vitals: log.vitals || `HR ${log.hr ?? "--"} BPM | SpO2 ${log.spo2 ? `${log.spo2}%` : "--"} | BP ${log.bp ?? "--"}`,
              lab: log.lab || "-",
              ecgDetail: log.ecgDetail || log.ecg_detail || "-",
              status: log.status || "-",
              conf: log.conf || "-",
              level: log.level || "NORMAL",
              color: log.color || "#16a34a",
              pathoNote: log.pathoNote || log.pathology || "-",
              plan: log.plan || "-",
            }));
            historyLogs = [...historyLogs, ...localLogs];
          }
        }
      } catch (e) {
        console.log("AsyncStorage history lookup fallback:", e);
      }

      // --- SOURCE 4: Baseline Fallback ---
      if (historyLogs.length === 0) {
        historyLogs.push({
          date: `${currentTime} (Current Baseline)`,
          vitals: `HR ${patient.hr ?? "--"} BPM | SpO2 ${patient.spo2 ? `${patient.spo2}%` : "--"} | BP ${patient.bp ?? "--"}`,
          lab: "Standard Metabolic & Cardiac Panel (Pending)",
          ecgDetail: `Real-time Rhythm Analysis: ${patient.status}`,
          status: patient.status,
          conf: patient.conf || 95.0,
          level: patient.level,
          color: patient.color,
          pathoNote: "ข้อมูลบันทึกแรกเริ่มต้นสำหรับการเฝ้าระวังผู้ป่วยด้วยระบบ SmartECG Monitoring System",
          plan: "1. Monitor telemetry continuous\n2. Re-evaluate vital signs q 15-30 min\n3. Record ECG Lead II continuously",
        });
      }

      const historyCardsHTML = historyLogs
        .map(
          (log: any) => `
          <div class="card" style="border-left: 5px solid ${log.color}; margin-bottom: 15px;">
            <div class="header-row">
              <span class="date">🕒 ${log.date}</span>
              <span class="badge" style="background-color: ${log.color};">${log.level}</span>
            </div>
            <div class="status" style="color: ${log.color};">${log.status}</div>
            
            <div class="box">
              <p><b>🩺 Vitals:</b> ${log.vitals}</p>
              <p><b>🧪 Lab / Biomarkers:</b> ${log.lab}</p>
              <p><b>📈 ECG Analysis:</b> ${log.ecgDetail}</p>
            </div>

            <div class="box white-box">
              <p><b>🧬 Pathophysiology:</b> ${log.pathoNote}</p>
            </div>

            <div class="box white-box">
              <p><b>💊 Clinical Plan & Guidelines:</b></p>
              <p style="white-space: pre-line;">${log.plan}</p>
            </div>

            <div class="footer-row">
              <span>AI Model Confidence Score: <b>${log.conf}${typeof log.conf === "number" ? "%" : ""}</b></span>
            </div>
          </div>
        `
        )
        .join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>SmartECG Comprehensive Patient Report - ${ptInfo.name}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #0f172a; background-color: #ffffff; }
              .title-header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
              .hospital-title { font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0; }
              .doc-title { font-size: 13px; color: #64748b; margin-top: 4px; }
              .patient-card { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
              .pt-id { background-color: #2563eb; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              .vital-grid { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
              .vital-box { flex: 1; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; }
              .vital-title { font-size: 10px; font-weight: bold; color: #64748b; }
              .vital-value { font-size: 22px; font-weight: bold; margin: 4px 0; }
              .vital-unit { font-size: 10px; color: #94a3b8; }
              .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 15px; page-break-inside: avoid; }
              .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
              .date { font-size: 12px; font-weight: bold; color: #475569; }
              .badge { color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
              .status { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
              .box { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 8px; font-size: 11px; line-height: 1.5; }
              .white-box { background-color: #fafafa; }
              .box p { margin: 2px 0; }
              .footer-row { text-align: right; font-size: 10px; color: #64748b; margin-top: 6px; }
              .disclaimer { margin-top: 20px; padding: 10px; background-color: #fffbe2; border: 1px solid #fef08a; border-radius: 6px; font-size: 10px; color: #854d0e; }
              .page-break { page-break-before: always; }
              .section-header { font-size: 15px; font-weight: bold; color: #1e3a8a; border-left: 4px solid #2563eb; padding-left: 8px; margin-bottom: 12px; }
            </style>
          </head>
          <body>
            <!-- PAGE 1: REAL-TIME MONITORING STATUS -->
            <div class="title-header">
              <h1 class="hospital-title">SmartECG Ward Clinical Monitoring Report</h1>
              <div class="doc-title">ส่วนที่ 1: สถานะการเฝ้าระวังคลื่นไฟฟ้าหัวใจเรียลไทม์ (Real-time Live Status)</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">พิมพ์รายงาน ณ วันที่: ${currentTime}</div>
            </div>

            <div class="patient-card">
              <span class="pt-id">${currentPatientDisplayId}</span> <span style="font-size: 12px; color: #64748b; font-weight: bold;">${ptInfo.hn}</span>
              <h2 style="margin: 5px 0; font-size: 18px;">${ptInfo.name}</h2>
              <div style="font-size: 12px; color: #475569;">เพศ: ${ptInfo.gender} | อายุ: ${ptInfo.age} ปี</div>
            </div>

            <div class="section-header">1. สัญญาณชีพและผลวิเคราะห์ปัจจุบัน (Current Live Vitals)</div>
            <div class="vital-grid">
              <div class="vital-box">
                <div class="vital-title">HEART RATE</div>
                <div class="vital-value" style="color: ${patient.color};">${patient.hr ?? "--"}</div>
                <div class="vital-unit">BPM</div>
              </div>
              <div class="vital-box">
                <div class="vital-title">SpO2</div>
                <div class="vital-value" style="color: ${patient.spo2 !== null && patient.spo2 < 90 ? "#dc2626" : "#2563eb"};">
                  ${patient.spo2 !== null && patient.spo2 !== undefined ? `${patient.spo2}%` : "--"}
                </div>
                <div class="vital-unit">O2 Saturation</div>
              </div>
              <div class="vital-box">
                <div class="vital-title">BLOOD PRESSURE</div>
                <div class="vital-value" style="color: ${patient.level === "EMERGENCY" ? "#dc2626" : "#16a34a"};">${patient.bp ?? "--"}</div>
                <div class="vital-unit">mmHg</div>
              </div>
            </div>

            <div class="card" style="border-left: 5px solid ${patient.color};">
              <div class="header-row">
                <span class="date">🔴 CURRENT LIVE STATUS</span>
                <span class="badge" style="background-color: ${patient.color};">${patient.level}</span>
              </div>
              <div class="status" style="color: ${patient.color};">${patient.status}</div>
              <div class="box">
                <p><b>📊 Clinical Assessment:</b> ผู้ป่วยกำลังได้รับการเฝ้าระวังในระบบ SmartECG Real-time Monitoring</p>
              </div>
            </div>

            <div class="disclaimer">
              <b>⚠️ ข้อตกลงและคำชี้แจงสิทธิ์ (Disclaimer):</b><br>
              เอกสารนี้ถูกสร้างโดยอัตโนมัติจากระบบ SmartECG Ward Prototype เพื่อใช้ในการศึกษา การวิจัย หรือการติดตามภายในเท่านั้น ไม่ได้เป็นเอกสารการแพทย์อย่างเป็นทางการ ห้ามใช้ทดแทนใบรับรองแพทย์หรือการตัดสินใจทางการแพทย์โดยเด็ดขาด
            </div>

            <!-- PAGE 2: CLINICAL HISTORY & PATHOPHYSIOLOGY -->
            <div class="page-break"></div>

            <div class="title-header">
              <h1 class="hospital-title">SmartECG Ward Clinical Monitoring Report</h1>
              <div class="doc-title">ส่วนที่ 2: บันทึกประวัติการตรวจและพยาธิวิทยาทางคลินิก (Clinical History & Pathophysiology)</div>
            </div>

            <div class="patient-card">
              <span class="pt-id">${currentPatientDisplayId}</span> <span style="font-size: 12px; color: #64748b; font-weight: bold;">${ptInfo.hn}</span>
              <h2 style="margin: 5px 0; font-size: 18px;">${ptInfo.name}</h2>
              <div style="font-size: 12px; color: #0369a1; margin-top: 6px;">
                <b>🩺 DIAGNOSIS:</b> ${ptInfo.diag}<br>
                <b>📊 CLINICAL RISK:</b> ${ptInfo.chads}
              </div>
            </div>

            <div class="section-header">2. บันทึกประวัติการตรวจย้อนหลังและแผนการรักษา</div>

            ${historyCardsHTML}

            <div class="disclaimer">
              <b>⚠️ ข้อตกลงและคำชี้แจงสิทธิ์ (Disclaimer):</b><br>
              เอกสารนี้ถูกสร้างโดยอัตโนมัติจากระบบ SmartECG Ward Prototype เพื่อใช้ในการศึกษา การวิจัย หรือการติดตามภายในเท่านั้น ไม่ได้เป็นเอกสารการแพทย์อย่างเป็นทางการ ห้ามใช้ทดแทนใบรับรองแพทย์หรือการตัดสินใจทางการแพทย์โดยเด็ดขาด
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (Platform.OS === "web") {
        await Print.printAsync({ html: htmlContent });
      } else {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: `ส่งออกเอกสาร PDF (รวม 2 หน้า) - ${ptInfo.name}`,
        });
      }
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error?.message || "ไม่สามารถส่งออก PDF ได้");
    } finally {
      setExportingPdf(false);
    }
  };

  if (loadingPatients && patients.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={{ marginTop: 10, color: "#64748b", fontSize: 13 }}>
          กำลังโหลดข้อมูลผู้ป่วย...
        </Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", padding: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#0f172a" }}>
          ไม่พบข้อมูลผู้ป่วย
        </Text>
        <TouchableOpacity
          style={{ marginTop: 15, backgroundColor: "#0284c7", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold" }}>กลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const oldImage = getOldPatientImage(patient.id);
  const mainImageSource = oldImage || (patient.ecg_image ? { uri: patient.ecg_image } : null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc", padding: 16 }}>
      {/* Patient Selector Tabs */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: "bold", color: "#64748b", marginBottom: 6 }}>
          เลือกผู้ป่วย (เรียงตามความอันตราย):
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {patients.map((item, index) => {
            const isSelected = item.id === patient.id;
            const currentLevel = evaluateLevelFromHR(item.hr, item.level);
            const levelStyle = getLevelStyle(currentLevel);

            return (
              <TouchableOpacity
                key={`tab-${item.id}-${index}`}
                onPress={() => setSelectedId(item.id)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: isSelected ? levelStyle.color : "#e2e8f0",
                }}
              >
                <Text style={{ color: isSelected ? "#ffffff" : "#334155", fontWeight: "bold", fontSize: 12 }}>
                  {item.name} ({item.displayId || item.id})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Patient Info Card */}
      <View style={S.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[S.badge, { backgroundColor: patient.color }]}>{patient.displayId || patient.id}</Text>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginTop: 2 }}>{patient.name}</Text>
            <Text style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{patient.gender} • {patient.age} ปี</Text>
          </View>

          <Text style={{ color: patient.color, fontWeight: "bold", fontSize: 12 }}>
            {patient.level === "EMERGENCY" ? "🚨 EMERGENCY" : "● LIVE"}
          </Text>
        </View>
      </View>

      {/* Vitals Summary */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <VitalBox label="HEART RATE" value={patient.hr ?? "--"} unit="BPM" color={patient.color} />
        <VitalBox
          label="SpO2"
          value={patient.spo2 !== null && patient.spo2 !== undefined ? `${patient.spo2}%` : "--"}
          unit="O2 Sat"
          color={patient.spo2 !== null && patient.spo2 < 90 ? "#dc2626" : "#2563eb"}
        />
        <VitalBox label="BP" value={patient.bp ?? "--"} unit="mmHg" color={patient.level === "EMERGENCY" ? "#dc2626" : "#16a34a"} />
      </View>

      {/* Waveform Section */}
      <View style={S.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ color: "#0284c7", fontWeight: "bold" }}>
            ⚡ LEAD II ECG WAVEFORM ({patient.displayId || patient.id})
          </Text>
          {mainImageSource && (
            <Text style={{ fontSize: 11, color: "#64748b" }}>🔍 แตะเพื่อซูมขยาย</Text>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (mainImageSource) {
              setSelectedZoomImage(mainImageSource);
              setIsModalVisible(true);
            }
          }}
          style={S.imgBox}
        >
          {mainImageSource ? (
            <Image key={patient.id} source={mainImageSource} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 10 }}>
              <Text style={{ color: "#22c55e", fontSize: 12, fontWeight: "bold", textAlign: "center" }}>
                📈 [ ECG Waveform Signal - {patient.displayId || patient.id} ]
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: 10, marginTop: 6, textAlign: "center" }}>
                ยังไม่มี ECG Image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ marginTop: 10, backgroundColor: patient.bg, borderColor: patient.border, borderWidth: 1, borderRadius: 8, padding: 10 }}>
          <Text style={{ color: patient.color, fontWeight: "bold", fontSize: 13 }}>ECG Status</Text>
          <Text style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{patient.status}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <TouchableOpacity
          style={[S.btnSecondary, { flex: 1 }]}
          onPress={() => router.push({ pathname: "/history", params: { patientId: patient.id } })}
        >
          <Text style={S.btnSecondaryText}>📋 ดูประวัติแบบเต็ม</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[S.btnExportPdf, { flex: 1 }]}
          onPress={exportToPDF}
          disabled={exportingPdf}
        >
          {exportingPdf ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={S.btnExportPdfText}>📄 Export PDF (รวม 2 หน้า)</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Disclaimer Section */}
      <View style={S.disclaimerBox}>
        <Text style={S.disclaimerTitle}>⚠️ ข้อตกลงและคำชี้แจงสิทธิ์ (Disclaimer)</Text>
        <Text style={S.disclaimerText}>
          แอปพลิเคชันนี้เป็นเพียงระบบต้นแบบ (Prototype) เพื่อการศึกษาและการวิจัยเท่านั้น ไม่ได้เป็นอุปกรณ์หรือเครื่องมือทางการแพทย์ สำหรับใช้ในการวินิจฉัย ประเมิน หรือรักษาโรคจริง ห้ามนำข้อมูลในระบบไปใช้ทดแทนการตัดสินใจ หรือการรักษาพยาบาลโดยแพทย์เด็ดขาด
        </Text>
      </View>

      <View style={{ height: 30 }} />

      {/* Image Zoom Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <View style={S.modalContainer}>
          <TouchableOpacity style={S.modalCloseButton} onPress={() => setIsModalVisible(false)}>
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
            {selectedZoomImage && (
              <Image source={typeof selectedZoomImage === "string" ? { uri: selectedZoomImage } : selectedZoomImage} style={S.fullEcgImage} resizeMode="contain" />
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ============================================================================
// 4. STYLES
// ============================================================================
const S = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  badge: { alignSelf: "flex-start", color: "#ffffff", fontWeight: "bold", fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  imgBox: { width: "100%", height: 180, backgroundColor: "#ffffff", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0" },
  btnSecondary: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#cbd5e1", paddingVertical: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  btnSecondaryText: { color: "#334155", fontWeight: "bold", fontSize: 12 },
  btnExportPdf: { backgroundColor: "#0284c7", paddingVertical: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  btnExportPdfText: { color: "#ffffff", fontWeight: "bold", fontSize: 12 },
  disclaimerBox: { padding: 10, backgroundColor: "#fffbe2", borderRadius: 8, borderWidth: 1, borderColor: "#fef08a" },
  disclaimerTitle: { color: "#854d0e", fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  disclaimerText: { color: "#a16207", fontSize: 10, lineHeight: 14 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.95)", justifyContent: "center", alignItems: "center" },
  modalCloseButton: { position: "absolute", top: 50, right: 20, backgroundColor: "rgba(255, 255, 255, 0.25)", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, zIndex: 999 },
  modalCloseText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
  modalHintText: { position: "absolute", bottom: 40, color: "#94a3b8", fontSize: 12, zIndex: 999, backgroundColor: "rgba(0, 0, 0, 0.6)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  modalScrollView: { width: "100%", height: "100%" },
  zoomScrollViewContent: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  fullEcgImage: { width: "100%", height: "80%", minWidth: 350, minHeight: 350 },
});