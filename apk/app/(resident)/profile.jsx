import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Shadows } from '../../src/theme/colors';
import { getUserProfile } from '../../src/api/residentEndPoints';

import { Platform } from 'react-native';

export default function ProfileScreen() {
  const { user, logoutUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getUserProfile();
        setProfile(res?.data?.data || null);
      } catch (err) {
        console.error('Failed to load resident profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

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
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        processLogout();
      }
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: processLogout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatarGradient}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </LinearGradient>
          <Text style={styles.userName}>{profile?.full_name || user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.email || user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="home" size={12} color={Colors.primary} />
            <Text style={styles.roleText}>{user?.role === 'serviceprovider' ? 'Service Provider' : 'Resident'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {[
            { icon: 'person-circle-outline', label: 'User Profile', onPress: () => router.push('/(resident)/edit-profile') },
            { icon: 'settings-outline', label: 'Settings', onPress: () => router.push('/(resident)/settings') },
            { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => router.push('/(resident)/support') },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator color={Colors.danger} size="small" />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          )}
          <Text style={styles.logoutText}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Home Fix v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 28 },
  avatarGradient: { width: 84, height: 84, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 76, height: 76, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  userName: { fontSize: 22, fontWeight: '700', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 10 },
  roleText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  menuCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 14, marginTop: 4 },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
  version: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 20, marginBottom: 30 },
});
