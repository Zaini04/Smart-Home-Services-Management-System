import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyJobs } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import { FadeInView } from '../../src/theme/animations';
import { useSocket } from '../../src/context/SocketContext';

const filters = ['all', 'active', 'completed', 'cancelled'];
const activeStatuses = [
  'provider_selected',
  'inspection_requested',
  'inspection_approved',
  'inspection_pending',
  'inspection_scheduled',
  'awaiting_price_approval',
  'price_approved',
  'work_in_progress',
];

const statusConfig = {
  provider_selected: { color: '#059669', bg: '#D1FAE5', label: 'Assigned' },
  inspection_requested: { color: '#D97706', bg: '#FEF3C7', label: 'Insp. Requested' },
  inspection_approved: { color: '#EA580C', bg: '#FFEDD5', label: 'Insp. Approved' },
  offer_accepted: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offer Accepted' },
  inspection_pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Pending' },
  inspection_scheduled: { color: '#F97316', bg: '#FFF7ED', label: 'Inspection Scheduled' },
  awaiting_price_approval: { color: '#D97706', bg: '#FFFBEB', label: 'Awaiting Approval' },
  price_approved: { color: '#14B8A6', bg: '#F0FDFA', label: 'Price Approved' },
  work_in_progress: { color: '#6366F1', bg: '#EEF2FF', label: 'In Progress' },
  completed: { color: '#22C55E', bg: '#DCFCE7', label: 'Completed' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled' },
};

export default function MyJobsScreen() {
  const router = useRouter();
  const { socket } = useSocket();
  const fetchInFlightRef = useRef(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchJobs = useCallback(async ({ silent = false } = {}) => {
    if (fetchInFlightRef.current) return;
    fetchInFlightRef.current = true;
    try {
      if (!silent) setLoading(true);
      const res = await getMyJobs();
      const rawData = res.data.data;
      const allJobs = Array.isArray(rawData) ? rawData : rawData?.bookings || [];
      const filteredJobs = activeFilter === 'all'
        ? allJobs
        : activeFilter === 'active'
          ? allJobs.filter((j) => activeStatuses.includes(j.status))
          : allJobs.filter((j) => j.status === activeFilter);
      setJobs(filteredJobs);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
      fetchInFlightRef.current = false;
    }
  }, [activeFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = () => fetchJobs({ silent: true });
    socket.on('data_updated', handler);
    return () => socket.off('data_updated', handler);
  }, [socket, fetchJobs]);

  const renderItem = ({ item, index }) => {
    const conf = statusConfig[item.status] || { color: Colors.textSecondary, bg: '#F3F4F6', label: item.status };

    return (
      <FadeInView delay={Math.min(index * 50, 400)}>
        <TouchableOpacity
          style={styles.jobCard}
          onPress={() => router.push(`/(provider)/job/${item._id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.jobHeader}>
            <Text style={styles.catName}>{item.category?.name || 'Service'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: conf.bg }]}>
              <Text style={[styles.statusText, { color: conf.color }]}>{conf.label}</Text>
            </View>
          </View>

          <Text style={styles.jobDesc} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.metaItem, styles.addressMetaItem]}>
              <Ionicons name="location-outline" size={14} color={Colors.textLight} style={styles.addressIcon} />
              <Text style={[styles.metaText, styles.addressText]}>
                {item.address || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.customerBox}>
            <Ionicons name="person" size={14} color={Colors.textSecondary} />
            <Text style={styles.customerName}>{item.resident?.full_name || item.resident?.name || 'Resident'}</Text>
          </View>

          <View style={styles.jobFooter}>
            <Text style={styles.priceLabel}>Final Price</Text>
            {item.finalPrice?.totalAmount > 0 ? (
              <Text style={styles.priceText}>Rs. {item.finalPrice.totalAmount}</Text>
            ) : (
              <Text style={[styles.priceText, { color: '#D97706', fontSize: 13 }]}>TBD</Text>
            )}
          </View>
        </TouchableOpacity>
      </FadeInView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Assigned Jobs</Text>
        <Text style={styles.headerSubtitle}>Track and manage your ongoing tasks</Text>
        <TouchableOpacity style={styles.findJobsBtn} onPress={() => router.push('/(provider)/available-jobs')}>
          <Ionicons name="search" size={16} color="#111827" />
          <Text style={styles.findJobsBtnText}>Find New Jobs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs({ silent: true }); }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Jobs Found</Text>
              <Text style={styles.emptyText}>You don&apos;t have any jobs matching this filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: 10 },
  findJobsBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDE047',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  findJobsBtnText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTextActive: { color: '#FFF' },
  jobCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  jobDesc: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'column', gap: 8, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressMetaItem: { alignItems: 'flex-start', paddingRight: 6 },
  addressIcon: { marginTop: 1 },
  customerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, marginBottom: 12 },
  customerName: { fontSize: 13, fontWeight: '500', color: Colors.text },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  priceLabel: { fontSize: 10, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaText: { fontSize: 12, color: Colors.textLight },
  addressText: { flex: 1, flexShrink: 1, lineHeight: 17, paddingRight: 4 },
  priceText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
});
