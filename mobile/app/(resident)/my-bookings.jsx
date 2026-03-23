import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyBookings } from '../../src/api/residentEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import { BASE_URL } from '../../src/api/apiInstance';

const statusConfig = {
  open: { color: '#3B82F6', bg: '#EFF6FF', label: 'Open', icon: 'time' },
  offer_accepted: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offer Accepted', icon: 'checkmark-circle' },
  inspection_pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Pending', icon: 'time' },
  inspection_scheduled: { color: '#F97316', bg: '#FFF7ED', label: 'Inspection Scheduled', icon: 'calendar' },
  awaiting_price_approval: { color: '#D97706', bg: '#FFFBEB', label: 'Awaiting Approval', icon: 'time' },
  price_approved: { color: '#14B8A6', bg: '#F0FDFA', label: 'Price Approved', icon: 'checkmark-circle' },
  work_in_progress: { color: '#6366F1', bg: '#EEF2FF', label: 'In Progress', icon: 'construct' },
  completed: { color: '#22C55E', bg: '#DCFCE7', label: 'Completed', icon: 'checkmark-done-circle' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: 'close-circle' },
};

const filters = ['all', 'active', 'completed', 'cancelled'];

export default function MyBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = activeFilter !== 'all' ? { status: activeFilter } : {};
      const res = await getMyBookings(params);
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [activeFilter]);

  const renderItem = ({ item }) => {
    const conf = statusConfig[item.status] || statusConfig.open;
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/(resident)/booking/${item._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.bookingTop}>
          <View style={styles.bookingImageBox}>
            {item.images?.[0] ? (
              <View style={styles.bookingImage}>
                <Ionicons name="image" size={20} color={Colors.textLight} />
              </View>
            ) : (
              <View style={styles.bookingImage}>
                <Ionicons name="clipboard-outline" size={20} color={Colors.textLight} />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingDesc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.bookingCategory}>{item.category?.name || 'Service'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: conf.bg }]}>
            <Ionicons name={conf.icon} size={12} color={conf.color} />
            <Text style={[styles.statusText, { color: conf.color }]}>{conf.label}</Text>
          </View>
        </View>
        <View style={styles.bookingBottom}>
          <View style={styles.bookingMeta}>
            <Ionicons name="location-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText} numberOfLines={1}>{item.address || 'N/A'}</Text>
          </View>
          {item.finalPrice?.totalAmount > 0 && (
            <Text style={styles.priceText}>Rs. {item.finalPrice.totalAmount.toLocaleString()}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Track all your service requests</Text>
      </View>

      {/* Filters */}
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

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>Post a job to get started</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(resident)/post-job')}>
                <Ionicons name="add-circle" size={18} color="#FFF" />
                <Text style={styles.emptyBtnText}>Post a Job</Text>
              </TouchableOpacity>
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
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTextActive: { color: '#FFF' },
  bookingCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  bookingTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bookingImageBox: { width: 50, height: 50, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  bookingImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  bookingDesc: { fontSize: 14, fontWeight: '600', color: Colors.text, lineHeight: 20 },
  bookingCategory: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '600' },
  bookingBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  bookingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  priceText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});
