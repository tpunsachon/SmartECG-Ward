import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; // 👈 1. Import useFocusEffect
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function AddPatientScreen() {
  const router = useRouter();

  // =========================
  // Patient Information
  // =========================
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('ชาย');

  // =========================
  // Vital Signs Information
  // =========================
  const [hr, setHr] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bp, setBp] = useState('');

  // =========================
  // ECG Information
  // =========================
  const [status, setStatus] = useState('Normal Sinus Rhythm');
  const [level, setLevel] = useState('NORMAL');

  // =========================
  // ECG Image & Loading State
  // =========================
  const [ecgImage, setEcgImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // Reset Form Function
  // =========================
  const resetForm = useCallback(() => {
    setName('');
    setAge('');
    setGender('ชาย');
    setHr('');
    setSpo2('');
    setBp('');
    setStatus('Normal Sinus Rhythm');
    setLevel('NORMAL');
    setEcgImage(null);
  }, []);

  // 👈 2. ล้างข้อมูลในฟอร์มทุกครั้งที่เปิด/สลับมาหน้านี้
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [resetForm])
  );

  // =========================
  // Pick ECG Image
  // =========================
  const pickECGImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'ไม่ได้รับอนุญาต',
          'กรุณาอนุญาตให้แอปเข้าถึงรูปภาพก่อน'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setEcgImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Image Picker Error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  // =========================
  // Remove ECG Image
  // =========================
  const removeECGImage = () => {
    setEcgImage(null);
  };

  // =========================
  // Save Patient to Supabase
  // =========================
  const handleSave = async () => {
    // ตรวจสอบชื่อ
    if (!name.trim()) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกชื่อ-นามสกุลผู้ป่วย');
      return;
    }

    // ตรวจสอบอายุ
    if (!age.trim()) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกอายุผู้ป่วย');
      return;
    }

    const ageNumber = Number(age);

    // ตรวจสอบว่าอายุเป็นตัวเลข
    if (isNaN(ageNumber)) {
      Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกอายุเป็นตัวเลข');
      return;
    }

    // ตรวจสอบช่วงอายุ
    if (ageNumber <= 0 || ageNumber > 150) {
      Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกอายุระหว่าง 1-150 ปี');
      return;
    }

    setLoading(true);

    try {
      const hn = `HN${Date.now()}`;

      // บันทึกข้อมูลทั้งหมดลงตาราง patients โดยตรง
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            hn: hn,
            name: name.trim(),
            age: ageNumber,
            gender: gender,
            level: level,
            status: status,
            ecg_image: ecgImage,
            hr: hr ? parseInt(hr, 10) : null,
            spo2: spo2 ? parseInt(spo2, 10) : null,
            bp: bp.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase Error:', error);
        Alert.alert('บันทึกไม่สำเร็จ', error.message);
        return;
      }

      console.log('บันทึกผู้ป่วยสำเร็จ:', data);

      // 👈 3. ล้างข้อมูลในฟอร์มหลังบันทึกสำเร็จ
      resetForm();

      Alert.alert(
        'บันทึกสำเร็จ',
        `เพิ่มข้อมูลผู้ป่วย ${name.trim()} เรียบร้อยแล้ว\nHN: ${hn}`,
        [
          {
            text: 'ตกลง',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Save Patient Error:', error);
      Alert.alert('เกิดข้อผิดพลาด', error?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* =========================
          Header
      ========================= */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Add New Patient</Text>
          <Text style={styles.headerSubtitle}>เพิ่มข้อมูลผู้ป่วยใหม่</Text>
        </View>
      </View>

      {/* =========================
          Patient Information
      ========================= */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👤 Patient Information</Text>

        {/* Name */}
        <Text style={styles.label}>ชื่อ-นามสกุล</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกชื่อ-นามสกุล"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        {/* Age */}
        <Text style={styles.label}>อายุ</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกอายุ"
          placeholderTextColor="#94a3b8"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          maxLength={3}
        />

        {/* Gender */}
        <Text style={styles.label}>เพศ</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'ชาย' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('ชาย')}
          >
            <Text
              style={[
                styles.genderText,
                gender === 'ชาย' && styles.genderTextActive,
              ]}
            >
              ชาย
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'หญิง' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('หญิง')}
          >
            <Text
              style={[
                styles.genderText,
                gender === 'หญิง' && styles.genderTextActive,
              ]}
            >
              หญิง
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================
          Vital Signs Information
      ========================= */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Vital Signs Information</Text>

        <View style={styles.vitalsRow}>
          {/* Heart Rate */}
          <View style={styles.vitalsCol}>
            <Text style={styles.label}>Heart Rate (BPM)</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 75"
              placeholderTextColor="#94a3b8"
              value={hr}
              onChangeText={setHr}
              keyboardType="numeric"
            />
          </View>

          {/* SpO2 */}
          <View style={styles.vitalsCol}>
            <Text style={styles.label}>SpO2 (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 98"
              placeholderTextColor="#94a3b8"
              value={spo2}
              onChangeText={setSpo2}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Blood Pressure */}
        <Text style={styles.label}>Blood Pressure (mmHg)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น 120/80"
          placeholderTextColor="#94a3b8"
          value={bp}
          onChangeText={setBp}
        />
      </View>

      {/* =========================
          Patient Level
      ========================= */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🚨 Patient Level</Text>
        <Text style={styles.label}>ระดับความสำคัญ</Text>

        <View style={styles.levelContainer}>
          {/* NORMAL */}
          <TouchableOpacity
            style={[
              styles.levelButton,
              level === 'NORMAL' && styles.normalActive,
            ]}
            onPress={() => setLevel('NORMAL')}
          >
            <Text
              style={[
                styles.levelText,
                level === 'NORMAL' && styles.levelTextActive,
              ]}
            >
              NORMAL
            </Text>
          </TouchableOpacity>

          {/* WARNING */}
          <TouchableOpacity
            style={[
              styles.levelButton,
              level === 'WARNING' && styles.warningActive,
            ]}
            onPress={() => setLevel('WARNING')}
          >
            <Text
              style={[
                styles.levelText,
                level === 'WARNING' && styles.levelTextActive,
              ]}
            >
              WARNING
            </Text>
          </TouchableOpacity>

          {/* CRITICAL */}
          <TouchableOpacity
            style={[
              styles.levelButton,
              level === 'CRITICAL' && styles.criticalActive,
            ]}
            onPress={() => setLevel('CRITICAL')}
          >
            <Text
              style={[
                styles.levelText,
                level === 'CRITICAL' && styles.levelTextActive,
              ]}
            >
              CRITICAL
            </Text>
          </TouchableOpacity>

          {/* EMERGENCY */}
          <TouchableOpacity
            style={[
              styles.levelButton,
              level === 'EMERGENCY' && styles.emergencyActive,
            ]}
            onPress={() => setLevel('EMERGENCY')}
          >
            <Text
              style={[
                styles.levelText,
                level === 'EMERGENCY' && styles.levelTextActive,
              ]}
            >
              EMERGENCY
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================
          ECG Status
      ========================= */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>❤️ ECG Information</Text>

        <Text style={styles.label}>ECG Status</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น Normal Sinus Rhythm"
          placeholderTextColor="#94a3b8"
          value={status}
          onChangeText={setStatus}
        />

        {/* ECG Image */}
        <Text style={styles.label}>ECG Image</Text>
        {!ecgImage ? (
          <TouchableOpacity style={styles.uploadButton} onPress={pickECGImage}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>เลือกรูป ECG</Text>
            <Text style={styles.uploadSubText}>เลือกรูปภาพจากเครื่อง</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: ecgImage }} style={styles.ecgImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={removeECGImage}
            >
              <Text style={styles.removeImageText}>✕ ลบรูป</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* =========================
          Save Button
      ========================= */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>💾 บันทึกข้อมูลผู้ป่วย</Text>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>ยกเลิก</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 30,
    color: '#334155',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 6,
  },
  // Vital Signs Layout
  vitalsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  vitalsCol: {
    flex: 1,
  },
  // Gender
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  genderButton: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  genderButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  genderText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  genderTextActive: {
    color: '#ffffff',
  },
  // Level
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    width: '48%',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  levelText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelTextActive: {
    color: '#ffffff',
  },
  normalActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  warningActive: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  criticalActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  emergencyActive: {
    backgroundColor: '#991b1b',
    borderColor: '#991b1b',
  },
  // ECG Upload
  uploadButton: {
    height: 130,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginTop: 4,
  },
  uploadIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  uploadText: {
    color: '#0284c7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  uploadSubText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#020617',
  },
  ecgImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removeImageButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    alignItems: 'center',
  },
  removeImageText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 13,
  },
  // Save
  saveButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Cancel
  cancelButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 30,
  },
});