# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

# 1. ชื่อแอป

#  SmartECG-Ward — ระบบมอนิเตอร์คลื่นไฟฟ้าหัวใจในวอร์ด

แอปพลิเคชันระบบมอนิเตอร์สัญญาณชีพและคลื่นไฟฟ้าหัวใจ (ECG Monitoring & Triage System) สำหรับพยาบาลและบุคลากรทางการแพทย์ในวอร์ดผู้ป่วยหนัก พัฒนาด้วย **React Native (Expo Router)** ร่วมกับ **TypeScript**

>  **คำชี้แจง (Disclaimer):** แอปพลิเคชันนี้จัดทำขึ้นเพื่อการศึกษาและเป็นชิ้นงานต้นแบบ (Prototype) เท่านั้น ไม่ใช่อุปกรณ์หรือเครื่องมือสำหรับวินิจฉัยทางการแพทย์จริง

# 2 . สมาชิกในกลุ่มและบทบาทหน้าที่

| สมาชิก | บทบาทหน้าที่ |
|---|---|
| นางสาววีระยารัตน์ กันธพงศ์  | พัฒนาระบบ Export Data สำหรับส่งออกข้อมูลจากระบบ |
| นางสาวธนัชพร ธัญญากุลวงศ์ | พัฒนาระบบ User Input สำหรับรับข้อมูลจากผู้ใช้ |
| นางสาวพรรษชล ชัยเจริญ | ออกแบบ UI/UX และโครงสร้างหน้าจอของแอปพลิเคชันด้วย React Native |
| นางสาวพัชรพรรณ นามศิริ | พัฒนาระบบ Sensor และเชื่อมต่อฐานข้อมูล |

# 3. ปัญหาและแรงจูงใจ

ในวอร์ดผู้ป่วยหนัก การติดตามสัญญาณชีพและการส่งเวรระหว่างกะมักเจอปัญหาภาระงานที่ล้นมือ (Work Overload) และภาวะล้าจากเสียงแจ้งเตือน (Alarm Fatigue) รวมถึงความเสี่ยงในการสื่อสารข้อมูลผิดพลาดขณะเปลี่ยนกะ

SmartECG-Ward จึงถูกพัฒนาขึ้นเพื่อเป็น Mobile-First Ward Monitoring Dashboard ที่ช่วยรวบรวมข้อมูลสัญญาณชีพและระดับความเสี่ยงของผู้ป่วยทั้งวอร์ดมาไว้ในจุดเดียว เพื่อช่วยให้บุคลากรทางการแพทย์เข้าถึงเคสฉุกเฉินได้อย่างรวดเร็ว จัดลำดับความสำคัญผู้ป่วย (Triage) ได้ชัดเจน และส่งเวรได้อย่างสะดวกรวดเร็ว

แรงจูงใจในการพัฒนาโปรเจกต์นี้คือการนำความรู้ด้าน React Native, Supabase, IoT Sensors และ Biomedical Technology มาประยุกต์ใช้ในการสร้างระบบต้นแบบที่แก้ปัญหาทางการแพทย์ได้จริง

# 4. ฟีเจอร์หลักของระบบ (Key Features)

**4.1. Authentication System Guard:** หน้าลงทะเบียน / เข้าสู่ระบบสำหรับเจ้าหน้าที่พยาบาล ป้องกันการเข้าถึงข้อมูลสุขภาพผู้ป่วยโดยไม่ได้รับอนุญาต
Ward Overview Dashboard (Auto-Triage): สรุปสถานะผู้ป่วยทั้งวอร์ด พร้อมจัดเรียงลำดับเคสฉุกเฉินอัตโนมัติตามระดับความเสี่ยง (EMERGENCY > CRITICAL > WARNING > NORMAL) โดยใช้ระบบ Triage Color-Coding
**4.2. Live Sensor Monitoring:** หน้าติดตามสัญญาณชีพ (Heart Rate, SpO2, Blood Pressure) และรูปคลื่นไฟฟ้าหัวใจ (ECG Waveform Viewer) จากเซนเซอร์แบบ Real-time รายบุคคล พร้อมฟังก์ชันขยายดูภาพ ECG
**4.3. Summary Overview Screen:** หน้าสรุปภาพรวมและสภาวะคลื่นหัวใจของผู้ป่วยเพื่อความสะดวกในการประเมินความเสี่ยงและส่งเวร (Shift Handover)
**4.4.Add Patient Form: ฟอร์มบันทึกรับผู้ป่วยใหม่เข้าสู่วอร์ด (/add-patient) พร้อมกำหนดระดับความเสี่ยงเบื้องต้นและบันทึกข้อมูลเข้าสู่ฐานข้อมูล
Patient Data Export System:** ระบบส่งออกข้อมูลและรายงานสรุปสถานะผู้ป่วยย้อนหลัง เพื่อใช้ในการบันทึกประวัติหรือนำเสนอข้อมูล

# 5. แผนภาพสถาปัตยกรรมของระบบ

## System Architecture

```text
                   ┌──────────────────┐
                   │      User        │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  React Native    │
                   │      App         │
                   └────────┬─────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
        ┌─────────────────┐   ┌─────────────────┐
        │ Authentication  │   │  Patient Data   │
        │     System      │   │     System      │
        └────────┬────────┘   └────────┬────────┘
                 │                     │
                 └──────────┬──────────┘
                            ▼
                   ┌──────────────────┐
                   │    Supabase      │
                   │     Database     │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ Patient / Sensor │
                   │      Data        │
                   └──────────────────┘
```

# **6.** วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. เครื่องมือที่ต้องเตรียมก่อนใช้งาน (Prerequisites)
* [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
* แอปพลิเคชัน **Expo Go** บน iOS / Android (กรณีต้องการทดสอบบนมือถือจริง) หรือโปรแกรม iOS Simulator / Android Studio Emulator

### 2. ดาวน์โหลดโค้ดและเข้าโฟลเดอร์โปรเจกต์ (Clone Project)
เปิด Terminal หรือ Command Prompt แล้วรันคำสั่ง:
```bash
git clone https://github.com/tpunsachon/SmartECG-Ward.git
cd SmartECG-Ward

``` 

## 7. Database / API / AI / Sensor

### 7.1 Database

โปรเจกต์ SmartECG-Ward ใช้ Supabase เป็น Database สำหรับจัดเก็บข้อมูลผู้ป่วย โดยข้อมูลที่กรอกผ่านหน้า Add Patient จะถูกบันทึกลงในฐานข้อมูล และสามารถเรียกกลับมาแสดงในแอปได้

ข้อมูลที่จัดเก็บประกอบด้วย

| Field      | Type      | Description                 |
| ---------- | --------- | --------------------------- |
| id         | UUID      | รหัสข้อมูล                  |
| patient_id | Text      | รหัสผู้ป่วย                 |
| name       | Text      | ชื่อผู้ป่วย                 |
| age        | Integer   | อายุ                        |
| gender     | Text      | เพศ                         |
| room       | Text      | ห้องผู้ป่วย                 |
| created_at | Timestamp | วันที่และเวลาที่เพิ่มข้อมูล |

การทำงานของ Database:

1. ผู้ใช้เข้าสู่หน้า Add Patient
2. ผู้ใช้กรอกข้อมูลผู้ป่วย
3. กดปุ่ม Save / Add Patient
4. แอปส่งข้อมูลไปยัง Supabase
5. Supabase บันทึกข้อมูลลงในตาราง `patients`
6. แอปสามารถเรียกข้อมูลกลับมาแสดงใน Dashboard หรือ Patient List

### 7.2 API

ในเวอร์ชันปัจจุบัน แอปใช้ Supabase Client สำหรับติดต่อกับ Database เพื่อเพิ่มและเรียกดูข้อมูลผู้ป่วย

ตัวอย่างการเพิ่มข้อมูลผู้ป่วย:

```javascript
const { data, error } = await supabase
  .from('patients')
  .insert([
    {
      patient_id: patientId,
      name: name,
      age: age,
      gender: gender,
      room: room
    }
  ]);
```

ตัวอย่างการเรียกข้อมูลผู้ป่วย:

```javascript
const { data, error } = await supabase
  .from('patients')
  .select('*');
```

> หมายเหตุ: โปรเจกต์เวอร์ชันปัจจุบันยังไม่มี Backend API แยก เช่น Node.js, Express หรือ FastAPI

### 7.3 AI

ปัจจุบัน SmartECG-Ward ยังไม่ได้เชื่อมต่อ AI หรือ Machine Learning สำหรับการวิเคราะห์ ECG จริง

แนวทางการพัฒนาในอนาคต ได้แก่

* วิเคราะห์รูปแบบสัญญาณ ECG ด้วย AI
* แสดงผลการวิเคราะห์ ECG
* แสดง Confidence Score
* เพิ่มคำอธิบายผลการวิเคราะห์
* บันทึกผลการวิเคราะห์ลง Database

AI ที่พัฒนาขึ้นในอนาคตมีวัตถุประสงค์เพื่อสนับสนุนการเรียนรู้และการแสดงข้อมูลเท่านั้น ไม่ใช้แทนการวินิจฉัยของบุคลากรทางการแพทย์

### 7.4 Sensor / IoT

### 7.4 Sensor / IoT (Hardware Integration)

ในระบบจริง สามารถเชื่อมต่อโมดูลเซนเซอร์วัดอัตราการเต้นของหัวใจและระดับออกซิเจนในเลือด **MAX30100** เข้ากับบอร์ดไมโครคอนโทรลเลอร์ **ESP32** เพื่อส่งค่าสัญญาณชีพตรงเข้าสู่ฐานข้อมูล Supabase แบบ Real-time

#### 1. แผนผังการต่อสายฮาร์ดแวร์ (Pin Wiring)

| MAX30100 Pin | ESP32 Pin | หมายเหตุ |
| :--- | :--- | :--- |
| **VCC** | **3.3V** | จ่ายไฟ 3.3V (ห้ามต่อ 5V เพื่อป้องกันเซนเซอร์เสียหาย) |
| **GND** | **GND** | กราวด์ร่วม |
| **SCL** | **GPIO 22** | สัญญาณนาฬิกา I2C |
| **SDA** | **GPIO 21** | สัญญาณข้อมูล I2C |

> ⚠️ **ข้อควรระวัง:** โมดูล MAX30100 บางรุ่นจำเป็นต้องตรวจสอบไฟเลี้ยง Pull-up Resistor บนสาย I2C ให้เป็น 3.3V เพื่อการอ่านค่าที่เสถียร

#### 2. ไลบรารีที่ต้องติดตั้งใน Arduino IDE
- `MAX30100lib` (โดย Oxullo)
- `ArduinoJson`

#### 3. โค้ด Arduino สำหรับ ESP32 (ส่งข้อมูลเข้า Supabase)

```

#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <WiFi.h>
#include <HTTPClient.h>

// --- 1. ตั้งค่าช่วงเวลา ---
#define REPORTING_PERIOD_MS 1000 // พิมพ์ลง Serial ทุก 1 วินาที
#define UPLOAD_INTERVAL_MS 2000  // ส่งขึ้น Supabase ทุก 2 วินาที

// --- 2. ข้อมูล WiFi และ Supabase ---esfcipiop
const char* ssid = "analoglism";
const char* password = "76242612";
const char* supabase_url = "https://lldyrdpobarqyhidvlqf.supabase.co/rest/v1/patient_monitors";
const char* supabase_key = "sb_publishable_QK-EKcewECovmMUVEIP_bg_at3sI3nc";

PulseOximeter pox;
uint32_t tsLastReport = 0;
uint32_t tsLastUpload = 0;

// ========================================================
// ⚡ Task แยกพิเศษ: บังคับรันบน Core 0 เพื่ออ่านค่าเซนเซอร์ตลอดเวลา
// (จะไม่โดนคำสั่งส่ง WiFi ขัดจังหวะเด็ดขาด)
// ========================================================
void TaskSensorUpdate(void *pvParameters) {
  for (;;) {
    pox.update(); // อ่านค่าจากเซนเซอร์ด้วยความถี่สูงตลอดเวลา
    vTaskDelay(1 / portTICK_PERIOD_MS); // คืนเวลาให้ OS 1ms
  }
}

// ========================================================
// ฟังก์ชันส่งข้อมูลขึ้น Supabase
// ========================================================
void sendToSupabase(float hr, float spo2) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabase_url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", String("Bearer ") + String(supabase_key));

    String jsonData = "{\"hr\":" + String(hr, 1) + ",\"spo2\":" + String(spo2, 1) + "}";

    int httpCode = http.POST(jsonData);
    Serial.print("Supabase HTTP Code: ");
    Serial.println(httpCode);

    if (httpCode == 201 || httpCode == 200) {
      Serial.println("Supabase upload SUCCESS!");
    } else {
      Serial.println("Supabase upload FAILED!");
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected!");
  }
}

void setup() {
  Serial.begin(115200);

  // 1. เชื่อมต่อ WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  // 2. เริ่มต้นเซนเซอร์ MAX30100
  if (!pox.begin()) {
    Serial.println("MAX30100 FAILED");
  } else {
    Serial.println("MAX30100 SUCCESS");
    pox.setIRLedCurrent(MAX30100_LED_CURR_24MA);
  }

  // 3.  สร้าง Task แยกไปรัน pox.update() บน Core 0
  xTaskCreatePinnedToCore(
    TaskSensorUpdate,   /* ชื่อฟังก์ชัน Task */
    "TaskSensorUpdate", /* ชื่อ Task */
    4096,               /* Stack size */
    NULL,               /* Parameter */
    2,                  /* Priority */
    NULL,               /* Task handle */
    0                   /* กำหนดให้รันบน Core 0 */
  );
}

void loop() {
  // ดึงค่าการวัดล่าสุด (ค่านี้ถูก Core 0 อัปเดตอยู่ตลอดเวลาแล้ว)
  float heartRate = pox.getHeartRate();
  float spo2 = pox.getSpO2();

  // 1. พิมพ์ลง Serial Monitor ทุกๆ 1 วินาที (ตามโค้ดเดิมของคุณ)
  if (millis() - tsLastReport >= REPORTING_PERIOD_MS) {
    Serial.print("Heart Rate: ");
    Serial.print(heartRate, 1);
    Serial.println(" BPM");

    Serial.print("SpO2: ");
    Serial.print(spo2, 1);
    Serial.println(" %");

    if (heartRate >= 40 && heartRate <= 200 && spo2 >= 85 && spo2 <= 100) {
      Serial.println("Status: VALID READING");
    } else {
      Serial.println("Status: WAITING FOR GOOD SIGNAL");
    }
    Serial.println("-------------------------");

    tsLastReport = millis();
  }

  // 2. ส่งขึ้น Supabase ทุกๆ 2 วินาที (ตามโค้ดเดิมของคุณ)
  if (millis() - tsLastUpload >= UPLOAD_INTERVAL_MS) {
    if (heartRate >= 40 && heartRate <= 200 && spo2 >= 85 && spo2 <= 100) {
      sendToSupabase(heartRate, spo2);
    } else {
      Serial.println("No finger detected -> Sending 0 to disconnect");
      sendToSupabase(0, 0); // 👈 เพิ่มบรรทัดนี้ลงไปครับ
    }

    tsLastUpload = millis();
  }
}
```

ระบบในอนาคตสามารถพัฒนาให้รองรับ

* การรับข้อมูล ECG แบบ Real-time
* การแสดงกราฟ ECG
* การบันทึกข้อมูล ECG ลง Database
* การตรวจสอบค่าตามเกณฑ์ที่กำหนด
* การแจ้งเตือนเมื่อพบค่าที่ต้องเฝ้าระวัง

---


## 8. ภาพหน้าจอ

### 8.1 Login
![Login Screen](screenshots/login.jp<img width="1206" height="2486" alt="IMG_3017" src="https://github.com/user-attachments/assets/b71879d0-291c-427a-82ea-7a7cbfa9009d" />
g)

### 8.2 Register
<img width="1206" height="2473" alt="IMG_3018" src="https://github.com/user-attachments/assets/4b266180-3f3c-4ddb-acee-095d7231d603" />

![Register Screen](screenshots/register.jpg)

### 8.3 Overview
<img width="603" height="1231" alt="Screenshot 2569-10-11 at 21 20 27" src="https://github.com/user-attachments/assets/4cb8ed18-3089-42b4-9678-79a003fca5d8" />
![Dashboard Screen](screenshots/dashboard.jpg)

### 8.4 Add Patient - Patient Information
<img width="603" height="1241" alt="Screenshot 2569-10-11 at 21 21 10" src="https://github.com/user-attachments/assets/d249f4b8-4d0d-4b7c-b40e-dc95f69697a2" />

![Add Patient Information](screenshots/add-patient.jpg)

### 8.5 Add Patient - ECG Information
<img width="603" height="1231" alt="Screenshot 2569-10-11 at 21 21 35" src="https://github.com/user-attachments/assets/a4655373-3648-435e-8463-594e48dd33cb" />
![Add Patient ECG Information](screenshots/add-patient-ecg.jpg)

### 8.6 Patient List
<img width="603" height="1244" alt="Screenshot 2569-10-11 at 21 22 30" src="https://github.com/user-attachments/assets/6e1f6512-ca11-4f77-9401-de45bcf687f4" />

![Patient List Screen](screenshots/patient-list.jpg)
### 8.7 Summary
<img width="603" height="1311" alt="Screenshot 2569-10-11 at 21 23 00 2" src="https://github.com/user-attachments/assets/8c055975-ad4e-46b0-bee4-f5bc59185420" />

---

> หมายเหตุ: รูปภาพหน้าจอของแอปพลิเคชันจัดเก็บไว้ในโฟลเดอร์ `screenshots` ของ Repository


## 9. วิดีโอสาธิต

วิดีโอสาธิตการทำงานของ SmartECG-Ward

[SmartECG-Ward Demo Video](https://www.youtube.com/shorts/iNqd_Qswxko)

ภายในวิดีโอควรแสดงการทำงานดังนี้

1. เปิดแอป
2. Register
3. Login
4. เข้าสู่ Dashboard
5. เพิ่มข้อมูลผู้ป่วยผ่าน Add Patient
6. บันทึกข้อมูลผู้ป่วย
7. แสดงข้อมูลผู้ป่วยที่บันทึกใน Database
8. แสดงการทำงานของหน้าจอหลัก

---

## 10. ข้อจำกัด

SmartECG-Ward เป็น Educational Prototype สำหรับการศึกษาและการพัฒนาระบบเท่านั้น

ข้อจำกัดของระบบในปัจจุบัน ได้แก่

* ยังไม่ได้เชื่อมต่อ ECG Sensor จริง
* ยังไม่มีการวิเคราะห์ ECG ด้วย AI จริง
* ยังไม่มี Backend API แยก เช่น Node.js, Express หรือ FastAPI
* ยังไม่ได้ผ่านการทดสอบหรือรับรองทางคลินิก
* ไม่ควรใช้ระบบเพื่อวินิจฉัยโรค
* ไม่ควรใช้ระบบเพื่อตัดสินใจในการรักษาผู้ป่วยจริง
* ข้อมูลที่ใช้ในการทดสอบเป็นข้อมูลสำหรับการพัฒนาต้นแบบ
* ระบบยังไม่สามารถทดแทนการทำงานของบุคลากรทางการแพทย์ได้

---

## 11. การพัฒนาต่อในอนาคต

### 11.1 Sensor / IoT

* เชื่อมต่อ ECG Sensor กับ ESP32
* รับข้อมูล ECG ผ่าน Wi-Fi
* รองรับ MQTT หรือ HTTP
* แสดงข้อมูล ECG แบบ Real-time
* เพิ่มระบบแจ้งเตือน

### 11.2 AI / Machine Learning

* พัฒนา AI สำหรับช่วยวิเคราะห์ ECG
* เพิ่มระบบ Classification
* แสดง Confidence Score
* เพิ่ม Explainable AI
* ทดสอบ AI Model กับ Dataset ที่เหมาะสม

### 11.3 Database

* เพิ่ม Patient History
* จัดเก็บประวัติ ECG
* เพิ่มระบบค้นหาและกรองข้อมูล
* รองรับการ Export ข้อมูลเป็น CSV / JSON / PDF

### 11.4 User System

* เพิ่ม User Role เช่น Doctor, Nurse และ Admin
* เพิ่มระบบกำหนดสิทธิ์การเข้าถึงข้อมูล
* เพิ่มระบบรักษาความปลอดภัยของข้อมูล
* ปรับปรุงระบบ Authentication

### 11.5 User Interface

* ปรับปรุง UI ให้ใช้งานง่ายขึ้น
* เพิ่มกราฟ ECG
* เพิ่มการแสดงสถานะข้อมูล
* รองรับอุปกรณ์หลายขนาด
* เพิ่ม Accessibility

---

## 12. Responsible Use

SmartECG-Ward เป็น Educational Prototype ที่จัดทำขึ้นเพื่อการศึกษา การทดลอง และการพัฒนาทักษะด้าน Software, IoT และ Healthcare Technology เท่านั้น

ระบบนี้ไม่ใช่อุปกรณ์ทางการแพทย์ และไม่ได้รับการรับรองสำหรับการใช้งานทางคลินิก

ข้อมูลและผลลัพธ์จากระบบไม่ควรถูกนำไปใช้เพื่อ

* วินิจฉัยโรค
* ตัดสินใจในการรักษา
* เปลี่ยนแปลงการรักษา
* ประเมินภาวะฉุกเฉินของผู้ป่วยจริง
* ใช้แทนคำแนะนำจากบุคลากรทางการแพทย์

หากนำระบบไปพัฒนาต่อเพื่อใช้งานจริง จำเป็นต้องมีการตรวจสอบความถูกต้อง ความปลอดภัยของข้อมูล ความเป็นส่วนตัวของผู้ป่วย การทดสอบทางคลินิก และการปฏิบัติตามมาตรฐานหรือข้อกำหนดที่เกี่ยวข้อง

ข้อมูลที่ใช้ในการพัฒนาและทดสอบระบบควรเป็นข้อมูลจำลองหรือข้อมูลที่ได้รับอนุญาตให้ใช้ และควรหลีกเลี่ยงการเปิดเผยข้อมูลส่วนบุคคลหรือข้อมูลสุขภาพของผู้ป่วยโดยไม่ได้รับอนุญาต
