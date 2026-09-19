#  SmartECG-Ward — ระบบมอนิเตอร์คลื่นไฟฟ้าหัวใจในวอร์ด

แอปพลิเคชันระบบมอนิเตอร์สัญญาณชีพและคลื่นไฟฟ้าหัวใจ (ECG Monitoring & Triage System) สำหรับพยาบาลและบุคลากรทางการแพทย์ในวอร์ดผู้ป่วยหนัก พัฒนาด้วย **React Native (Expo Router)** ร่วมกับ **TypeScript**

>  **คำชี้แจง (Disclaimer):** แอปพลิเคชันนี้จัดทำขึ้นเพื่อการศึกษาและเป็นชิ้นงานต้นแบบ (Prototype) เท่านั้น ไม่ใช่อุปกรณ์หรือเครื่องมือสำหรับวินิจฉัยทางการแพทย์จริง


## เทคโนโลยีที่ใช้ (Tech Stack)

* **Framework:** React Native (Expo Router v3)
* **Language:** TypeScript
* **State & Routing:** File-based Routing (Expo Router)
* **UI & Styling:** Custom Pastel Light Theme / React Native StyleSheet

##  ฟีเจอร์หลักของระบบ (Key Features)

1. **Authentication System Guard:** หน้าลงทะเบียน / เข้าสู่ระบบสำหรับเจ้าหน้าที่พยาบาล พร้อมกั้นสิทธิ์การเข้าถึงข้อมูลผู้ป่วย
2. **Ward Overview (Dashboard):** สรุปสถานะผู้ป่วยทั้งวอร์ด พร้อมจัดหมวดหมู่ความเสี่ยงตามมาตรฐาน Triage Color-Coding (`NORMAL`, `WARNING`, `CRITICAL`, `EMERGENCY`)
3. **Individual Live ECG Monitoring:** หน้าดูคลื่นไฟฟ้าหัวใจและสัญญาณชีพ (BPM, SpO2, BP) แบบเรียลไทม์รายบุคคล พร้อมผลวิเคราะห์จำลองด้วย AI Confidence Score
4. **Summary Overview Screen:** สรุปภาพรวมรูปคลื่นสัญญาณ ECG ผู้ป่วยทุกคนในวอร์ดเปรียบเทียบกันในหน้าเดียว
5. **Add Patient Form:** ฟอร์มรับลงทะเบียนผู้ป่วยใหม่เข้าสู่วอร์ด (`/add-patient`) พร้อมกำหนดระดับความเสี่ยงเบื้องต้น


##  วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. เครื่องมือที่ต้องเตรียมก่อนใช้งาน (Prerequisites)
* [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
* แอปพลิเคชัน **Expo Go** บน iOS / Android (กรณีต้องการทดสอบบนมือถือจริง) หรือโปรแกรม iOS Simulator / Android Studio Emulator

### 2. ดาวน์โหลดโค้ดและเข้าโฟลเดอร์โปรเจกต์ (Clone Project)
เปิด Terminal หรือ Command Prompt แล้วรันคำสั่ง:
```bash
git clone <URL_REPOSITORY_ของคุณ>
cd SmartECG-Ward
