import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyJobs } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

const filters = ['all', 'active', 'completed', 'cancelled'];

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
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = activeFilter !== 'all' ? { status: activeFilter } : {};
      const res = await getMyJobs(params);
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [activeFilter]);

  const renderItem = ({ item }) => {
    const conf = statusConfig[item.status] || { color: Colors.textSecondary, bg: '#F3F4F6', label: item.status };

    return (
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
        
        <View style={styles.customerBox}>
          <Ionicons name="person" size={14} color={Colors.textSecondary} />
          <Text style={styles.customerName}>{item.resident?.name || 'Resident'}</Text>
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText} numberOfLines={1}>{item.address}</Text>
          </View>
          {item.finalPrice?.totalAmount > 0 && (
            <Text style={styles.priceText}>Rs. {item.finalPrice.totalAmount}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Assigned Jobs</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} />}
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
  jobDesc: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  customerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, marginBottom: 12 },
  customerName: { fontSize: 13, fontWeight: '500', color: Colors.text },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 12, color: Colors.textLight },
  priceText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
});
