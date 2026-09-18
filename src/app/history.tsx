import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PATIENT_HISTORY: Record<string, any> = {
  PT1: {
    name: 'กรองแก้ว บุญมี',
    age: 62,
    gender: 'หญิง',
    hn: 'HN 66-04912',
    diag: 'Paroxysmal Atrial Fibrillation with Rapid Ventricular Response (RVR)',
    chads: 'CHA₂DS₂-VASc Score = 3 (Age, Sex, Hypertension)',
    logs: [
      {
        date: '19 ก.ย. 2026 • 08:30 น. (Emergency Department)',
        vitals: 'HR 112 BPM (Irregular) | SpO2 96% (RA) | BP 138/88 mmHg | RR 22/min | T 36.8°C',
        lab: 'K+ 3.8 mEq/L | Mg2+ 1.9 mg/dL | High-Sensitivity Troponin-I: < 0.01 ng/mL (Negative)',
        ecgDetail: 'Lead II: Absence of P waves, replaced by fibrillatory waves (f-waves), irregularly irregular QRS complexes (R-R interval varies). Average HR ~112 BPM.',
        status: 'Atrial Fibrillation with RVR',
        conf: 96.8,
        level: 'CRITICAL',
        color: '#dc2626',
        bg: '#fef2f2',
        pathoNote: 'เกิดจาก Ectopic foci บริเวณ Pulmonary veins ยิงกระแสไฟฟ้าถี่รวดเร็ว ชนกับ Reentry circuits ในหัวใจห้องบน ทำให้ AV Node ไม่สามารถกรองสัญญาณได้ทัน ส่งผลให้ Ventricular rate ไวเกินกำหนด',
        plan: '1. Rate Control: Diltiazem 15 mg IV bolus over 2 min\n2. Anticoagulation: Start Apixaban (Eliquis) 5 mg PO BID (เนื่องจาก CHA₂DS₂-VASc = 3)\n3. Monitor telemetry CONTINUOUSLY'
      },
      {
        date: '18 ก.ย. 2026 • 16:45 น. (Cardiology Clinic)',
        vitals: 'HR 108 BPM | SpO2 97% | BP 135/85 mmHg | RR 20/min',
        lab: 'INR: 2.1 | Serum Creatinine: 0.85 mg/dL (eGFR 78 mL/min)',
        ecgDetail: 'Atrial Fibrillation with Moderate Ventricular Response',
        status: 'Atrial Fibrillation Detected',
        conf: 94.2,
        level: 'CRITICAL',
        color: '#dc2626',
        bg: '#fef2f2',
        pathoNote: 'ผู้ป่วยเริ่มมีอาการ Palpitation และ Exertional Dyspnea เนื่องจาก Cardiac Output ลดลงประมาณ 20-30% จากการสูญเสีย Atrial Kick',
        plan: 'ปรับเพิ่มยา Beta-blocker (Metoprolol Tartrate 25 mg 1x2 oral) เพื่อควบคุม AV nodal conduction'
      },
      {
        date: '15 ก.ย. 2026 • 10:15 น. (Routine OPD Check-up)',
        vitals: 'HR 85 BPM | SpO2 98% | BP 128/82 mmHg | RR 18/min',
        lab: 'FBS: 104 mg/dL | Lipid Profile: Normal limits',
        ecgDetail: 'Normal Sinus Rhythm with Occasional Atrial Premature Complexes (APCs)',
        status: 'Normal Sinus Rhythm',
        conf: 98.1,
        level: 'NORMAL',
        color: '#16a34a',
        bg: '#f0fdf4',
        pathoNote: 'จังหวะ Sinus Node ทำหน้าที่เป็น Pacemaker หลักตามปกติ พบ APCs ซึ่งเป็นสัญญาณเตือนระยะแรกของ Paroxysmal AFib',
        plan: 'นัดติดตามผล Holter Monitoring (24-hr) เพื่อประเมินความถี่ของ Paroxysmal AFib'
      },
    ],
  },
  PT2: {
    name: 'วรรณรสา อรุณรัศมิ์',
    age: 58,
    gender: 'หญิง',
    hn: 'HN 65-11084',
    diag: 'Hypertensive Heart Disease with Left Ventricular Hypertrophy (LVH)',
    chads: 'Echocardiogram: LVM Index = 124 g/m² (Concentric LVH)',
    logs: [
      {
        date: '19 ก.ย. 2026 • 09:10 น. (Hypertension Excellence Clinic)',
        vitals: 'HR 88 BPM | SpO2 98% | BP 145/92 mmHg | RR 18/min',
        lab: 'Sokolow-Lyon Voltage: S_V1 + R_V5 = 39 mm (>35 mm) | Cornell Voltage = 24 mm',
        ecgDetail: 'High voltage QRS, ST-segment depression with T-wave inversion in Lead I, aVL, V5, V6 (Left Ventricular Strain Pattern)',
        status: 'LVH with Strain Pattern',
        conf: 92.4,
        level: 'WARNING',
        color: '#d97706',
        bg: '#fffbeb',
        pathoNote: 'เกิดจาก Chronic Afterload Overload จากโรคความดันโลหิตสูง ทำให้เซลล์กล้ามเนื้อหัวใจห้องซ้ายล่าง (Cardiomyocytes) เพิ่มขนาดความหนา (Hypertrophy) เพื่อลด Wall Stress ส่งผลให้เกิดภาวะ subendocardial ischemia (Strain pattern)',
        plan: '1. Up-titrate ACEI/ARB: Enalapril 10 mg 1x2 PO\n2. Add Calcium Channel Blocker: Amlodipine 5 mg PO OD\n3. Target BP < 130/80 mmHg เพื่อชะลอ LV Remodeling'
      },
      {
        date: '12 ก.ย. 2026 • 14:20 น. (OPD General)',
        vitals: 'HR 82 BPM | SpO2 98% | BP 140/90 mmHg | RR 16/min',
        lab: 'Urine Microalbumin: 45 mg/g Cr (Microalbuminuria positive)',
        ecgDetail: 'Sinus Rhythm with LVH criteria by Voltage (No Strain pattern yet)',
        status: 'LVH Detected',
        conf: 91.0,
        level: 'WARNING',
        color: '#d97706',
        bg: '#fffbeb',
        pathoNote: 'พบการหนาตัวของผนังหัวใจชัดเจน เริ่มส่งผลกระทบต่อ Diastolic relaxation (Diastolic Dysfunction grade 1)',
        plan: 'เน้นย้ำการปรับเปลี่ยนพฤติกรรม (Lifestyle Modification) ร่วมกับจำกัดโซเดียม < 2.0 g/day'
      },
      {
        date: '01 ก.ย. 2026 • 11:00 น. (Annual Physical Examination)',
        vitals: 'HR 78 BPM | SpO2 99% | BP 138/88 mmHg | RR 16/min',
        lab: 'eGFR: 72 mL/min/1.73m² | Serum Potassium: 4.2 mEq/L',
        ecgDetail: 'Borderline Left Axis Deviation, Normal QRS amplitude',
        status: 'Normal Sinus Rhythm',
        conf: 95.5,
        level: 'NORMAL',
        color: '#16a34a',
        bg: '#f0fdf4',
        pathoNote: 'คลื่นไฟฟ้าหัวใจอยู่ในช่วงคาบเกี่ยว (Borderline) เริ่มมีการเบี่ยงของแกนหัวใจไปทางซ้าย',
        plan: 'ส่งตรวจ Echocardiogram เพื่อดูโครงสร้างและมวลของกล้ามเนื้อหัวใจเพิ่มเติม'
      },
    ],
  },
  PT3: {
    name: 'พุฒิภัทร จุฑาเทพ',
    age: 45,
    gender: 'ชาย',
    hn: 'HN 67-00129',
    diag: 'Normal Cardiac Conduction & Healthy Cardiovascular Status',
    chads: 'Cardiovascular Risk Assessment = Low Risk (< 1%)',
    logs: [
      {
        date: '19 ก.ย. 2026 • 07:45 น. (Executive Health Center)',
        vitals: 'HR 72 BPM | SpO2 99% (RA) | BP 120/80 mmHg | RR 16/min | T 36.5°C',
        lab: 'Fasting Plasma Glucose: 92 mg/dL | HbA1c: 5.3% | Total Cholesterol: 178 mg/dL',
        ecgDetail: 'Normal Sinus Rhythm. P wave upright in II, III, aVF. PR interval 0.16s, QRS duration 0.08s, QTc 410ms. No ST-T changes.',
        status: 'Normal Sinus Rhythm',
        conf: 99.1,
        level: 'NORMAL',
        color: '#16a34a',
        bg: '#f0fdf4',
        pathoNote: 'ระบบนำไฟฟ้าของหัวใจสมบูรณ์ สัญญาณจาก SA Node วิ่งผ่าน Atria, AV Node, Bundle of His และ Purkinje fibers ตามลำดับเวลามาตรฐาน',
        plan: 'ให้คำแนะนำการส่งเสริมสุขภาพ (Primary Prevention) และตรวจสุขภาพประจำปีตามปกติ'
      },
      {
        date: '10 ก.ย. 2026 • 08:00 น. (Cardiovascular Fitness Test)',
        vitals: 'HR 70 BPM | SpO2 99% | BP 118/78 mmHg | RR 14/min',
        lab: 'CXR: Normal CTR (0.42), Clear lung fields | High-sensitivity CRP: 0.5 mg/L',
        ecgDetail: 'Normal Sinus Rhythm with sinus arrhythmia during deep respiration (Physiological)',
        status: 'Normal Sinus Rhythm',
        conf: 99.4,
        level: 'NORMAL',
        color: '#16a34a',
        bg: '#f0fdf4',
        pathoNote: 'พบ Sinus Arrhythmia ตามธรรมชาติจากการเปลี่ยนแปลงของ Vagal tone ระหว่างการหายใจเข้า-ออก',
        plan: 'ผลการตรวจอยู่ในเกณฑ์ดีเยี่ยม สามารถออกกำลังกายระดับปานกลาง-หนักได้อย่างปลอดภัย'
      },
      {
        date: '01 ก.ย. 2026 • 09:30 น. (OPD Follow-up)',
        vitals: 'HR 75 BPM | SpO2 98% | BP 122/80 mmHg | RR 16/min',
        lab: 'CBC: Hb 15.2 g/dL, Hct 45% | Electrolytes: Na 140, K 4.1, Cl 102, CO2 24 mEq/L',
        ecgDetail: 'Normal ECG baseline',
        status: 'Normal Sinus Rhythm',
        conf: 98.9,
        level: 'NORMAL',
        color: '#16a34a',
        bg: '#f0fdf4',
        pathoNote: 'ไม่พบพยาธิสภาพของระบบไหลเวียนโลหิตและสัญญาณไฟฟ้าหัวใจ',
        plan: 'คงการดูแลสุขภาพตามเดิม'
      },
    ],
  },
  PT4: {
    name: 'มารตี เทวพรหม',
    age: 67,
    gender: 'หญิง',
    hn: 'HN 64-08821',
    diag: 'Acute Anterior Wall STEMI leading to Ventricular Fibrillation (Cardiac Arrest)',
    chads: 'TIMI Risk Score = 11/14 (High Risk / Critical)',
    logs: [
      {
        date: '19 ก.ย. 2026 • 09:55 น. (ER Resuscitation Room - CPR in progress)',
        vitals: 'HR ~185 BPM (Unmeasurable pulse) | SpO2 Unmeasurable | BP Unmeasurable (0/0) | RR Apneic',
        lab: 'hs-Troponin T: 3,450 ng/L (Critical High) | K+: 3.1 mEq/L (Hypokalemia) | Arterial Blood Gas: Severe Metabolic Acidosis (pH 7.12, HCO3- 12)',
        ecgDetail: 'Lead II: Chaotic, irregular, coarse wave form with varying amplitude and shape. Complete absence of identifiable P, QRS, or T waves (VFib).',
        status: 'Ventricular Fibrillation (VFib)',
        conf: 98.9,
        level: 'EMERGENCY',
        color: '#991b1b',
        bg: '#ffe4e6',
        pathoNote: 'เกิดจาก Ischemia เฉียบพลันบริเวณกล้ามเนื้อหัวใจห้องซ้ายล่าง (LAD occlusion) ร่วมกับภาวะ Hypokalemia ส่งผลให้เกิด Reentry circuits ขนาดย่อยๆ กระจายทั่วห้องหัวใจล่าง ไม่อาจสูบฉีดเลือดไปเลี้ยงร่างกายได้เลย (Cardiac Arrest)',
        plan: '🚨 HIGH PRIORITY CODE RED ACTION:\n1. Immediate Unsynchronized Defibrillation (Biphasic 200 Joules)\n2. High-quality CPR (100-120 compressions/min)\n3. Epinephrine 1 mg IV q 3-5 min + Amiodarone 300 mg IV Push\n4. Prepare for Emergency Primary PCI (Cath Lab) post-ROSC'
      },
      {
        date: '19 ก.ย. 2026 • 06:15 น. (ER Triage Area)',
        vitals: 'HR 120 BPM | SpO2 93% (RA) | BP 110/70 mmHg | RR 24/min',
        lab: 'ECG 12-Lead: ST-segment elevation > 2 mm in V1-V4 with Frequent R-on-T PVCs',
        ecgDetail: 'Sinus Tachycardia with Acute Anterior STEMI & Ventricular Ectopy',
        status: 'STEMI with Severe Ventricular Ectopy',
        conf: 95.0,
        level: 'CRITICAL',
        color: '#dc2626',
        bg: '#fef2f2',
        pathoNote: 'หลอดเลือดหัวใจ LAD มีการอุดตันเฉียบพลันจาก Atherosclerotic plaque rupture มีคลื่น PVC ตกบน T wave (R-on-T phenomenon) ซึ่งเป็นสัญญาณอันตรายสูงสุดก่อนเปลี่ยนเป็น VFib',
        plan: 'ให้ Aspirin 320 mg chew + Ticagrelor 180 mg PO immediately, O2 High-flow, Activate Cath Lab'
      },
      {
        date: '17 ก.ย. 2026 • 18:30 น. (IPD Coronary Care Unit)',
        vitals: 'HR 95 BPM | SpO2 96% | BP 130/85 mmHg | RR 20/min',
        lab: 'NT-proBNP: 1,850 pg/mL | Echo: LVEF 42% with Anterior Wall Hypokinesia',
        ecgDetail: 'Sinus Rhythm, T-wave inversion in V3-V6 (Ischemic changes)',
        status: 'Unstable Angina / Non-STE ACS',
        conf: 89.7,
        level: 'WARNING',
        color: '#d97706',
        bg: '#fffbeb',
        pathoNote: 'ภาวะหลอดเลือดหัวใจตีบแคบรุนแรง (Subtotal occlusion) กล้ามเนื้อหัวใจเริ่มมีภาวะขาดเลือดสะสม',
        plan: 'ให้ Heparin IV drip, Nitroglycerin drip, และนัดทำ Coronary Angiogram (CAG)'
      },
    ],
  },
};

export default function HistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawId = params.patientId || params.id;
  const patientKey = String(Array.isArray(rawId) ? rawId[0] : rawId || '').toUpperCase().trim();
  const activeId = PATIENT_HISTORY[patientKey] ? patientKey : 'PT1';

  const patient = PATIENT_HISTORY[activeId];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16 }}>
      {/* Header Profile Card */}
      <View style={S.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Text style={S.badge}>{activeId}</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#64748b' }}>{patient.hn}</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>{patient.name}</Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{patient.gender} • {patient.age} ปี</Text>
            
            <View style={{ backgroundColor: '#f0f9ff', padding: 8, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: '#bae6fd' }}>
              <Text style={{ color: '#0369a1', fontSize: 11, fontWeight: 'bold' }}>
                🩺 DIAGNOSIS: {patient.diag}
              </Text>
              <Text style={{ color: '#0284c7', fontSize: 10, marginTop: 2 }}>
                📊 {patient.chads}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={S.liveBtn} 
            onPress={() => router.push({ pathname: '/live', params: { patientId: activeId } })}
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 11 }}>⚡ LIVE ECG</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 }}>
        📋 ประวัติการประมวลผล ECG และพยาธิวิทยาทางคลินิกย้อนหลัง
      </Text>

      {/* Medical Logs */}
      {patient.logs.map((log: any, index: number) => (
        <View key={index} style={[S.card, { backgroundColor: log.bg, borderColor: log.color + '50' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#475569' }}>🕒 {log.date}</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff', backgroundColor: log.color, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              {log.level}
            </Text>
          </View>

          <Text style={{ fontSize: 15, fontWeight: 'bold', color: log.color, marginBottom: 8 }}>
            {log.status}
          </Text>

          <View style={S.clinicalBox}>
            <Text style={S.clinicalText}>🩺 <Text style={{ fontWeight: 'bold' }}>Vitals:</Text> {log.vitals}</Text>
            <Text style={S.clinicalText}>🧪 <Text style={{ fontWeight: 'bold' }}>Lab / Biomarkers:</Text> {log.lab}</Text>
            <Text style={S.clinicalText}>📈 <Text style={{ fontWeight: 'bold' }}>ECG Analysis:</Text> {log.ecgDetail}</Text>
          </View>

          <View style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 }}>
            <Text style={{ fontSize: 11, color: '#334155', lineHeight: 16 }}>
              🧬 <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>Pathophysiology (กลไกการเกิดโรค):</Text> {log.pathoNote}
            </Text>
          </View>

          <View style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 11, color: '#0f172a', lineHeight: 16 }}>
              💊 <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>Clinical Plan & Guidelines:</Text>{'\n'}{log.plan}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, borderTopWidth: 1, borderColor: '#cbd5e1', paddingTop: 6 }}>
            <Text style={{ fontSize: 10, color: '#64748b' }}>AI Model Confidence Score: <Text style={{ fontWeight: 'bold', color: log.color }}>{log.conf}%</Text></Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={S.btnSecondary} onPress={() => router.push('/overview')}>
        <Text style={S.btnSecondaryText}>⬅ กลับหน้า Patient Monitoring (Overview)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const S = {
  card: { backgroundColor: '#ffffff', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  badge: { backgroundColor: '#2563eb', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: 'bold' as const },
  liveBtn: { backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  clinicalBox: { backgroundColor: '#ffffff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', gap: 4, marginBottom: 8 },
  clinicalText: { fontSize: 11, color: '#1e293b', lineHeight: 16 },
  btnSecondary: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center' as const, marginTop: 8, marginBottom: 30 },
  btnSecondaryText: { color: '#334155', fontWeight: 'bold' as const, fontSize: 13 },
};