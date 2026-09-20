import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SummaryScreen({ navigation }) {
  // ข้อมูลจำลองสำหรับแสดงในหน้า Summary
  const summaryData = {
    patientName: "คุณสมชาย ใจดี",
    hn: "HN-67091234",
    status: "ปกติ (Normal)",
    bpm: 72,
    spO2: 98,
    recordedAt: "20 ก.ย. 2026 | 14:30 น.",
  };

  return (
    <ScrollView style={styles.container}>
      {/* 1. ส่วนหัวข้อ (Header) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>สรุปผลการตรวจ (Summary)</Text>
        <Text style={styles.headerSubtitle}>บันทึกข้อมูลล่าสุดจาก SmartECG Ward</Text>
      </View>

      {/* 2. การ์ดข้อมูลผู้ป่วย (Patient Info Card) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle-outline" size={28} color="#2A7BDE" />
          <Text style={styles.cardTitle}>ข้อมูลผู้ป่วย</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>ชื่อ-นามสกุล:</Text>
          <Text style={styles.value}>{summaryData.patientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>รหัส HN:</Text>
          <Text style={styles.value}>{summaryData.hn}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>เวลาบันทึก:</Text>
          <Text style={styles.value}>{summaryData.recordedAt}</Text>
        </View>
      </View>

      {/* 3. การ์ดสรุปค่าสัญญาณชีพ (Vitals Summary) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-dislike-outline" size={28} color="#E53935" />
          <Text style={styles.cardTitle}>ผลการวิเคราะห์ ECG & Vitals</Text>
        </View>
        <View style={styles.divider} />

        {/* สถานะหลัก */}
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>สถานะจังหวะหัวใจ:</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{summaryData.status}</Text>
          </View>
        </View>

        {/* ตารางแสดงค่า BPM และ SpO2 */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Ionicons name="heart" size={24} color="#E53935" />
            <Text style={styles.metricValue}>{summaryData.bpm}</Text>
            <Text style={styles.metricUnit}>BPM (อัตราการเต้น)</Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.metricItem}>
            <Ionicons name="water" size={24} color="#00ACC1" />
            <Text style={styles.metricValue}>{summaryData.spO2}%</Text>
            <Text style={styles.metricUnit}>SpO2 (ออกซิเจน)</Text>
          </View>
        </View>
      </View>

      {/* 4. ปุ่มดำเนินการต่อ (Action Buttons) */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={() => alert('บันทึกข้อมูลเรียบร้อย')}
        >
          <Ionicons name="save-outline" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>บันทึกข้อมูล (Save)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.secondaryButtonText}>วัดค่าใหม่อีกครั้ง</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Styling ตกแต่งหน้าจอ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 16,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1D1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow สำหรับ iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation สำหรับ Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6C757D',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1D1E',
    marginVertical: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: '#6C757D',
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EAEAEA',
  },
  buttonGroup: {
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2A7BDE',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#E9ECEF',
  },
  secondaryButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
});