import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Shadows } from '../../src/theme/colors';
import { getProviderProfile } from '../../src/api/serviceProviderEndPoints';

export default function WorkerProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = user?._id || user?.user_id;
        if (!userId) return;
        const res = await getProviderProfile(userId);
        setProfile(res?.data?.data || null);
      } catch (err) {
        console.error('Failed to load provider profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?._id, user?.user_id]);

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
        <View style={styles.profileHeader}>
          <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.avatarGradient}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </View>
          </LinearGradient>
          <Text style={styles.userName}>{user?.full_name || 'Provider'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="build" size={12} color={Colors.primary} />
            <Text style={styles.roleText}>Worker Profile</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {[
            { icon: 'person-outline', label: 'Edit Worker Profile', onPress: () => router.push('/(provider)/edit-profile') },
            { icon: 'ribbon-outline', label: `${profile?.experience || 0} years experience` },
            { icon: 'card-outline', label: profile?.cnic || 'CNIC not set' },
            { icon: 'pricetag-outline', label: `Visit Price: Rs. ${Number(profile?.visitPrice || 0).toLocaleString()}` },
            { icon: 'cash-outline', label: `Hourly Rate: Rs. ${Number(profile?.hourlyRate || 0).toLocaleString()}` },
            { icon: 'checkmark-done-circle-outline', label: `KYC: ${profile?.kycStatus || 'unknown'}` },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress} disabled={!item.onPress}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuLabel} numberOfLines={1}>{item.label}</Text>
              {item.onPress ? <Ionicons name="chevron-forward" size={16} color={Colors.textLight} /> : null}
            </TouchableOpacity>
          ))}
        </View>
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
});
