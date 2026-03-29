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

const StatCard = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value || 0}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProviderDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getProviderDashboard();
      setStats(res.data.data.stats);
      setWalletBalance(res.data.data.walletBalance);
      setRecentJobs(res.data.data.recentJobs || []);
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
      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.header}>
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

        {/* Wallet Card — inside blue gradient */}
        <TouchableOpacity
          style={styles.walletCard}
          onPress={() => router.push('/(provider)/wallet')}
          activeOpacity={0.85}
        >
          <View style={styles.walletLeft}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={22} color="#FFF" />
            </View>
            <View>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>Rs. {(walletBalance || 0).toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.walletArrow}>
            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
          </View>
        </TouchableOpacity>
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
                <StatCard icon="document-text" label="Offers Made" value={stats?.offersMade} color="#F59E0B" />
                <StatCard icon="star" label="Rating" value={stats?.avgRating} color="#EAB308" />
              </View>
            </View>

            {/* Income Summary */}
            <View style={styles.incomeCard}>
              <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.incomeGradient}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.incomeLabel}>Total Earnings</Text>
                    <Text style={styles.incomeValue}>Rs. {(stats?.totalEarnings || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.incomeIcon}>
                    <Ionicons name="cash-outline" size={28} color="#16A34A" />
                  </View>
                </View>
              </LinearGradient>
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
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
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
  walletCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 16, marginTop: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  walletLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  walletAmount: { fontSize: 20, fontWeight: '700', color: '#FFF', marginTop: 2 },
  walletArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { padding: 20 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 24 },
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
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  incomeCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24, elevation: 3 },
  incomeGradient: { padding: 20 },
  incomeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  incomeValue: { fontSize: 28, fontWeight: '700', color: '#FFF', marginTop: 4 },
  incomeIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
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
