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

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# SmartECG-Ward
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
# SmartECG-Ward
