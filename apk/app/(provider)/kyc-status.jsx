import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';
import { getProviderDashboard } from '../../src/api/serviceProviderEndPoints';

export default function KYCStatusScreen() {
  const router = useRouter();
  const { logoutUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');
  const [kycMessage, setKycMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await getProviderDashboard();
      const status = res.data.data?.provider?.kycStatus || 'pending';
      setKycStatus(status);
      setKycMessage(res.data.data?.provider?.kycMessage || '');
      
      if (status === 'approved') {
        router.replace('/(provider)/dashboard');
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  const processLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutUser();
      Toast.show({
        type: 'success',
        text1: 'Logged out',
        text2: 'You have been signed out successfully.',
      });
      router.replace('/(auth)/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: processLogout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const getStatusConfig = () => {
    switch (kycStatus) {
      case 'rejected':
        return {
          icon: 'close-circle',
          color: Colors.danger,
          bgColor: Colors.dangerLight,
          title: 'Profile Rejected',
          desc: kycMessage || 'Your profile was reviewed and needs some changes. Please update your details and resubmit.',
          showEdit: true,
        };
      case 'pending':
      case 'waiting':
      default:
        return {
          icon: 'time',
          color: Colors.warning,
          bgColor: Colors.warningLight,
          title: 'Application Pending',
          desc: 'We are currently reviewing your documents. This process usually takes 1-2 business days. You will be notified once your account is approved.',
          showEdit: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={60} color={config.color} />
        </View>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.desc}>{config.desc}</Text>
        
        {config.showEdit && (
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: Colors.primary, marginBottom: 12 }]} 
            onPress={() => router.push('/(provider)/edit-profile')}
          >
            <Text style={[styles.btnText, { color: '#FFF' }]}>Edit & Resubmit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator color={Colors.danger} size="small" />
          ) : (
            <Text style={styles.btnText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', padding: 30, borderRadius: 24, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  iconBox: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  desc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  btn: { width: '100%', paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.dangerLight, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600', color: Colors.danger },
});
