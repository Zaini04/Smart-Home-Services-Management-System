import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyBookings } from '../../src/api/residentEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import { FadeInView } from '../../src/theme/animations';
import { useSocket } from '../../src/context/SocketContext';

const statusConfig = {
  posted: { color: '#3B82F6', bg: '#EFF6FF', label: 'Waiting for Offers', icon: 'time' },
  offers_received: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offers Received', icon: 'list' },
  provider_selected: { color: '#6366F1', bg: '#EEF2FF', label: 'Provider Selected', icon: 'person' },
  offer_accepted: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offer Accepted', icon: 'checkmark-circle' },
  inspection_requested: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Requested', icon: 'search' },
  inspection_approved: { color: '#10B981', bg: '#D1FAE5', label: 'Inspection Approved', icon: 'checkmark-done' },
  inspection_pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Pending', icon: 'time' },
  inspection_scheduled: { color: '#F97316', bg: '#FFF7ED', label: 'Inspection Scheduled', icon: 'calendar' },
  awaiting_price_approval: { color: '#D97706', bg: '#FFFBEB', label: 'Awaiting Approval', icon: 'time' },
  price_approved: { color: '#14B8A6', bg: '#F0FDFA', label: 'Price Approved', icon: 'checkmark-circle' },
  work_in_progress: { color: '#6366F1', bg: '#EEF2FF', label: 'In Progress', icon: 'construct' },
  completed: { color: '#22C55E', bg: '#DCFCE7', label: 'Completed', icon: 'checkmark-done-circle' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: 'close-circle' },
};

const filters = ['all', 'active', 'completed', 'cancelled'];
const activeStatuses = [
  'posted',
  'offers_received',
  'offer_accepted',
  'provider_selected',
  'inspection_requested',
  'inspection_approved',
  'inspection_pending',
  'inspection_scheduled',
  'awaiting_price_approval',
  'price_approved',
  'work_in_progress',
];

export default function MyBookingsScreen() {
  const router = useRouter();
  const { socket } = useSocket();
  const fetchInFlightRef = useRef(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBookings = useCallback(async ({ silent = false } = {}) => {
    if (fetchInFlightRef.current) return;
    fetchInFlightRef.current = true;
    try {
      if (!silent) setLoading(true);
      const res = await getMyBookings();
      const rawData = res.data.data;
      const allBookings = Array.isArray(rawData) ? rawData : rawData?.bookings || [];

      const filteredBookings = activeFilter === 'all'
        ? allBookings
        : activeFilter === 'active'
          ? allBookings.filter((b) => activeStatuses.includes(b.status))
          : allBookings.filter((b) => b.status === activeFilter);

      setBookings(filteredBookings);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
      fetchInFlightRef.current = false;
    }
  }, [activeFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = () => fetchBookings({ silent: true });
    socket.on('data_updated', handler);
    return () => socket.off('data_updated', handler);
  }, [socket, fetchBookings]);

  const renderItem = ({ item, index }) => {
    const conf = statusConfig[item.status] || {
      color: Colors.textSecondary,
      bg: '#F3F4F6',
      label: item.status || 'Unknown',
      icon: 'help-circle-outline',
    };
    return (
      <FadeInView delay={index * 50}>
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
            <View style={styles.bookingMetaContainer}>
              <View style={styles.bookingMeta}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textLight} />
                <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.bookingMeta, styles.addressMeta]}>
                <Ionicons name="location-outline" size={14} color={Colors.textLight} />
                <Text style={[styles.metaText, styles.addressText]} numberOfLines={2}>
                  {item.address || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.bookingFooter}>
            {item.selectedProvider ? (
              <View style={styles.providerInfo}>
                <Ionicons name="person-circle-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.providerText}>
                  Assigned: {item.selectedProvider?.userId?.name || item.selectedProvider?.name || 'Provider'}
                </Text>
              </View>
            ) : (
                <View style={styles.providerInfo}>
                  <Text style={styles.providerNotAssigned}>Not assigned yet</Text>
                </View>
            )}
            {item.finalPrice?.totalAmount > 0 && (
              <Text style={styles.priceText}>Rs. {item.finalPrice.totalAmount.toLocaleString()}</Text>
            )}
          </View>
        </TouchableOpacity>
      </FadeInView>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings({ silent: true }); }} />}
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
  bookingBottom: { flexDirection: 'column', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  bookingMetaContainer: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bookingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressMeta: { flex: 1, minWidth: 0, alignItems: 'flex-start' },
  bookingFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  providerInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  providerText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  providerNotAssigned: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic' },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  addressText: { flex: 1, flexShrink: 1, minWidth: 0, lineHeight: 16 },
  priceText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});
