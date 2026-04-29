import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { getProviderDashboard } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import DrawerMenu from '../../components/DrawerMenu';

const { width } = Dimensions.get('window');

const StatCard = ({ icon, label, value, subtitle, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value || 0}</Text>
    {subtitle ? <Text style={styles.statSubValue}>{subtitle}</Text> : null}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProviderDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [provider, setProvider] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getProviderDashboard();
      const payload = res?.data?.data || {};
      setStats(payload.stats || {});
      setProvider(payload.provider || null);
      setWalletBalance(
        payload.wallet?.balance ??
        payload.walletBalance ??
        payload.availableBalance ??
        0
      );
      setRecentJobs(payload.recentJobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const getStatusColor = (status) => {
    const config = {
      open: '#3B82F6', offer_accepted: '#8B5CF6', 
      work_in_progress: '#6366F1', completed: '#22C55E', cancelled: '#EF4444'
    };
    return config[status] || Colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      {/* Header Profile Area */}
      <LinearGradient colors={['#111827', '#1F2937']} style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.hamburgerBtn} onPress={() => setDrawerOpen(true)}>
            <Ionicons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.full_name}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(); }} />}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(provider)/available-jobs')}>
                <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.actionBg}>
                  <Ionicons name="search" size={24} color="#16A34A" />
                </LinearGradient>
                <Text style={styles.actionText}>Find Jobs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(provider)/my-offers')}>
                <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.actionBg}>
                  <Ionicons name="document-text" size={24} color="#DC2626" />
                </LinearGradient>
                <Text style={styles.actionText}>My Offers</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(provider)/my-jobs')}>
                <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.actionBg}>
                  <Ionicons name="briefcase" size={24} color="#4F46E5" />
                </LinearGradient>
                <Text style={styles.actionText}>Active Jobs</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                <StatCard icon="briefcase" label="Total Jobs" value={stats?.totalJobs} color="#3B82F6" />
                <StatCard icon="checkmark-done-circle" label="Completed" value={stats?.completedJobs} color="#22C55E" />
                <StatCard icon="wallet" label="Wallet Amount" value={`Rs. ${Number(walletBalance || 0).toLocaleString()}`} color="#14B8A6" />
                <StatCard
                  icon="star"
                  label="Rating"
                  value={Number(provider?.rating ?? stats?.avgRating ?? 0).toFixed(1)}
                  subtitle={`(${Number(provider?.ratingCount ?? stats?.ratingCount ?? 0)} reviews)`}
                  color="#EAB308"
                />
              </View>
            </View>

            {/* Recent Jobs */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Jobs</Text>
                <TouchableOpacity onPress={() => router.push('/(provider)/my-jobs')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {recentJobs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No recent jobs</Text>
                </View>
              ) : (
                recentJobs.map(job => (
                  <TouchableOpacity key={job._id} style={styles.jobCard} onPress={() => router.push(`/(provider)/job/${job._id}`)}>
                    <View style={styles.jobTop}>
                      <View>
                        <Text style={styles.jobTitle} numberOfLines={1}>{job.category?.name}</Text>
                        <Text style={styles.jobDesc} numberOfLines={1}>{job.description}</Text>
                      </View>
                      <View style={[styles.jobStatus, { backgroundColor: `${getStatusColor(job.status)}15` }]}>
                        <Text style={[styles.jobStatusText, { color: getStatusColor(job.status) }]}>
                          {job.status.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.jobBottom}>
                      {job.finalPrice?.totalAmount > 0 && (
                        <Text style={styles.jobPrice}>Rs. {job.finalPrice.totalAmount}</Text>
                      )}
                      <Text style={styles.jobDate}>{new Date(job.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Drawer */}
      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} role="provider" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  hamburgerBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  name: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  scrollContent: { padding: 20 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 24 },
  actionBtn: { alignItems: 'center', width: '30%' },
  actionBg: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: (width - 50) / 2, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.borderLight },
  statIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.text },
  statSubValue: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, marginTop: 2 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  emptyState: { padding: 30, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: Colors.borderLight },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: 10 },
  jobCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.borderLight },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  jobDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, width: '90%' },
  jobStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  jobStatusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  jobBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  jobPrice: { fontSize: 15, fontWeight: '700', color: Colors.text },
  jobDate: { fontSize: 12, color: Colors.textLight },
});
