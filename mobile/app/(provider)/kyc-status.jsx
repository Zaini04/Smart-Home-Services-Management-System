import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';

export default function KYCStatusScreen() {
  const router = useRouter();
  const { logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name="time" size={60} color={Colors.warning} />
        </View>
        <Text style={styles.title}>Application Pending</Text>
        <Text style={styles.desc}>
          We are currently reviewing your documents. This process usually takes 1-2 business days.
          You will be notified once your account is approved.
        </Text>
        
        <TouchableOpacity style={styles.btn} onPress={handleLogout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', padding: 30, borderRadius: 20, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  iconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.warningLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  desc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  btn: { width: '100%', paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.dangerLight, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600', color: Colors.danger },
});
