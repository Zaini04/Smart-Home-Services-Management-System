import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, Dimensions, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getProviderDashboard } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

const COMMISSION_TIERS = [
  { range: "0 - 10,000", rate: "15%" },
  { range: "10,001 - 50,000", rate: "12%" },
  { range: "50,001+", rate: "10%" },
];

export default function EarningsScreen() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getProviderDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const provider = data?.provider || {};
  const stats = data?.stats || {};

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSubtitle}>Track your income and wallet balance</Text>
        </View>

        {/* Wallet Card */}
        <LinearGradient
          colors={['#22C55E', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <View style={styles.walletTopRow}>
            <View>
              <Text style={styles.walletLabel}>Total Wallet Balance</Text>
              {loading ? (
                <ActivityIndicator color="#FFF" style={{ marginTop: 8 }} />
              ) : (
                <Text style={styles.walletAmount}>Rs. {(provider.walletBalance || 0).toLocaleString()}</Text>
              )}
            </View>
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet" size={24} color="#FFF" />
            </View>
          </View>
          
          <View style={styles.walletActionRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(provider)/wallet')}>
              <Text style={styles.btnPrimaryText}>Withdraw Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(provider)/wallet')}>
              <Text style={styles.btnSecondaryText}>History</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {/* Today's Earnings */}
          <View style={[styles.statBox, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="cash" size={20} color="#2563EB" />
            </View>
            {loading ? <ActivityIndicator size="small" /> : <Text style={styles.statValue}>Rs. {(stats.todayEarnings || 0).toLocaleString()}</Text>}
            <Text style={styles.statLabel}>Today&apos;s Earnings</Text>
          </View>

          {/* Jobs Completed */}
          <View style={[styles.statBox, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            </View>
            {loading ? <ActivityIndicator size="small" /> : <Text style={styles.statValue}>{stats.completedJobs || 0}</Text>}
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>

          {/* Active Jobs */}
          <View style={[styles.statBox, { backgroundColor: '#FAF5FF', borderColor: '#F3E8FF' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="briefcase" size={20} color="#9333EA" />
            </View>
            {loading ? <ActivityIndicator size="small" /> : <Text style={styles.statValue}>{stats.activeJobs || 0}</Text>}
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
        </View>

        {/* Commission Tiers */}
        <View style={styles.commissionSection}>
          <Text style={styles.sectionTitle}>Commission Structure</Text>
          <View style={styles.commissionCard}>
            {COMMISSION_TIERS.map((tier, idx) => (
              <View key={idx} style={[styles.tierRow, idx < COMMISSION_TIERS.length - 1 && styles.borderBottom]}>
                <View>
                  <Text style={styles.tierLabel}>Labor Rs. {tier.range}</Text>
                  <Text style={styles.tierSub}>Commission rate</Text>
                </View>
                <Text style={styles.tierRate}>{tier.rate}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.bonusCard}>
            <Text style={styles.bonusTitle}>✨ New Provider Bonus</Text>
            <Text style={styles.bonusSub}>First 5 completed jobs get 50% off commission!</Text>
          </View>
        </View>

        {/* Example Calculation */}
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>💡 Example Calculation</Text>
          
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Your Labor Charge</Text>
            <Text style={styles.calcValue}>Rs. 2,000</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Material Cost</Text>
            <Text style={styles.calcValue}>Rs. 500</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { fontWeight: '600' }]}>Resident Pays Total</Text>
            <Text style={[styles.calcValue, { fontWeight: '600' }]}>Rs. 2,500</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Platform Fee (15% of Rs. 2,000)</Text>
            <Text style={[styles.calcValue, { color: '#DC2626' }]}>- Rs. 300</Text>
          </View>
          
          <View style={styles.calcTotalRow}>
            <Text style={styles.calcTotalLabel}>Your Earning</Text>
            <Text style={styles.calcTotalValue}>Rs. 2,200</Text>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  walletCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 20, ...Shadows.medium },
  walletTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  walletLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  walletAmount: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  walletIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  walletActionRow: { flexDirection: 'row', gap: 12 },
  btnPrimary: { flex: 1, backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#16A34A', fontSize: 14, fontWeight: '700' },
  btnSecondary: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnSecondaryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statBox: { flex: 1, minWidth: (width - 64) / 3, borderRadius: 16, padding: 16, borderWidth: 1 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  commissionSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  commissionCard: { backgroundColor: '#FFF', borderRadius: 16, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F9FAFB' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tierLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  tierSub: { fontSize: 12, color: Colors.textSecondary },
  tierRate: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  bonusCard: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#DCFCE7' },
  bonusTitle: { fontSize: 14, fontWeight: '600', color: '#166534', marginBottom: 4 },
  bonusSub: { fontSize: 12, color: '#15803D' },
  exampleCard: { marginHorizontal: 20, backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  exampleTitle: { fontSize: 15, fontWeight: '600', color: '#1E40AF', marginBottom: 16 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  calcLabel: { fontSize: 13, color: Colors.textSecondary },
  calcValue: { fontSize: 13, fontWeight: '500', color: Colors.text },
  calcTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#93C5FD' },
  calcTotalLabel: { fontSize: 14, fontWeight: '700', color: '#15803D' },
  calcTotalValue: { fontSize: 14, fontWeight: '700', color: '#15803D' },
});
