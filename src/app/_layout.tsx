import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = () => {
    if (!email || !password) return;
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setName('');
  };

  // หน้า Auth (Log In / Register) - ชุดสีตามต้องการ
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fdffd0' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🏥</Text>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#ae3494' }}>Smart ECG Ward</Text>
            <Text style={{ color: '#1668ba', fontSize: 14, marginTop: 4 }}>
              {isRegistering ? 'ลงทะเบียนพยาบาล / เจ้าหน้าที่' : 'ระบบมอนิเตอร์คลื่นไฟฟ้าหัวใจในวอร์ด'}
            </Text>
          </View>

          <View style={{ backgroundColor: '#4bccff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#fefefe' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 16, textAlign: 'center' }}>
              {isRegistering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </Text>

            {isRegistering && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#060606', fontSize: 12, marginBottom: 4 }}>ชื่อ-นามสกุล / ตำแหน่ง</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="พว. สมหญิง รักดี"
                  placeholderTextColor="#64748b"
                  style={{ backgroundColor: '#ffb2e8', color: '#000000', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffd6f8' }}
                />
              </View>
            )}

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#060606', fontSize: 12, marginBottom: 4 }}>อีเมล / รหัสพนักงาน</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="nurse@hospital.com"
                placeholderTextColor="#202050"
                autoCapitalize="none"
                style={{ backgroundColor: '#ffb2e8', color: '#000000', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffd6f8' }}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#060606', fontSize: 12, marginBottom: 4 }}>รหัสผ่าน</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
                style={{ backgroundColor: '#ffb2e8', color: '#000000', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffd6f8' }}
              />
            </View>

            <TouchableOpacity
              onPress={handleAuth}
              style={{ backgroundColor: '#ffffff', padding: 14, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#191818', fontWeight: 'bold', fontSize: 15 }}>
                {isRegistering ? 'ยืนยันการสมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsRegistering(!isRegistering)}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#f4f6f7', fontSize: 13 }}>
                {isRegistering ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // แสดง Bottom Tabs หลังเข้าสู่ระบบ - Header สีฟ้า `#7fc1ff` ตามที่คุณกำหนด
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#7fc1ff' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 13 }}>🚪 ออกจากระบบ</Text>
          </TouchableOpacity>
        ),
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      {/* 1. แท็บ Overview */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          headerTitle: 'Smart ECG Ward',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏥</Text>,
        }}
      />

      {/* 2. แท็บ Live Monitor */}
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live Monitor',
          headerTitle: 'Live ECG Monitoring',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>⚡</Text>,
        }}
      />

      {/* 3. แท็บ Summary */}
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          headerTitle: 'Ward Summary Overview',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📈</Text>,
        }}
      />

      {/* --- ซ่อนไฟล์ย่อยไม่ให้โผล่เป็นแท็บด้านล่าง --- */}
      <Tabs.Screen name="add-patient" options={{ href: null, headerTitle: 'ลงทะเบียนผู้ป่วยใหม่' }} />
      <Tabs.Screen name="patient-live" options={{ href: null, headerTitle: 'Live Patient ECG' }} />
      <Tabs.Screen name="history" options={{ href: null, headerTitle: 'Patient History' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="overview" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
      <Tabs.Screen name="logout" options={{ href: null }} />
    </Tabs>
  );
}