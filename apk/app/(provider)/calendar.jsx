import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { Calendar } from 'react-native-calendars';
import { getMyJobs } from '../../src/api/serviceProviderEndPoints';
import { FadeInView } from '../../src/theme/animations';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const formatDateKey = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function ProviderCalendar() {
  const router = useRouter();
  const [allBookings, setAllBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await getMyJobs({ status: 'all' });
      const rawData = res.data.data;
      const bookings = (Array.isArray(rawData) ? rawData : rawData?.bookings || []).filter(
        (b) => !['completed', 'cancelled'].includes(b.status)
      );
      setAllBookings(bookings);
    } catch (e) {
      console.log('Error fetching dates', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Filter bookings for the selected date
  const selectedBookings = allBookings.flatMap((b) => {
    const events = [];
    const inspectionMatch = b.inspection?.scheduledDate &&
      !b.inspection?.completedByProvider &&
      formatDateKey(b.inspection.scheduledDate) === selectedDate;
    const workMatch = b.schedule?.scheduledStartDate &&
      b.schedule?.approvedByResident &&
      formatDateKey(b.schedule.scheduledStartDate) === selectedDate;

    if (inspectionMatch && (activeFilter === 'all' || activeFilter === 'inspection')) {
      events.push({ ...b, eventType: 'inspection' });
    }
    if (workMatch && (activeFilter === 'all' || activeFilter === 'work')) {
      events.push({ ...b, eventType: 'work' });
    }
    return events;
  });
  const sortedSelectedBookings = [...selectedBookings].sort((a, b) => {
    const aTime = a.eventType === 'inspection'
      ? new Date(a.inspection?.scheduledDate || 0).getTime()
      : new Date(a.schedule?.scheduledStartDate || 0).getTime();
    const bTime = b.eventType === 'inspection'
      ? new Date(b.inspection?.scheduledDate || 0).getTime()
      : new Date(b.schedule?.scheduledStartDate || 0).getTime();
    return aTime - bTime;
  });

  const todayKey = formatDateKey(new Date());
  const markedWithSelected = {};
  allBookings.forEach((b) => {
    const inspectionDate = b.inspection?.scheduledDate && !b.inspection?.completedByProvider
      ? formatDateKey(b.inspection.scheduledDate)
      : '';
    const workDate = b.schedule?.scheduledStartDate && b.schedule?.approvedByResident
      ? formatDateKey(b.schedule.scheduledStartDate)
      : '';

    if (inspectionDate && (activeFilter === 'all' || activeFilter === 'inspection')) {
      markedWithSelected[inspectionDate] = {
        customStyles: {
          container: { backgroundColor: '#F59E0B', borderRadius: 16 },
          text: { color: '#111827', fontWeight: '700' },
        },
      };
    }
    if (workDate && (activeFilter === 'all' || activeFilter === 'work')) {
      markedWithSelected[workDate] = {
        customStyles: {
          container: { backgroundColor: '#EF4444', borderRadius: 16 },
          text: { color: '#FFFFFF', fontWeight: '700' },
        },
      };
    }
  });

  if (todayKey) {
    markedWithSelected[todayKey] = {
      customStyles: {
        container: { backgroundColor: Colors.primary, borderRadius: 16 },
        text: { color: '#FFFFFF', fontWeight: '700' },
      },
    };
  }
  if (selectedDate) {
    const isTodaySelected = selectedDate === todayKey;
    markedWithSelected[selectedDate] = {
      customStyles: {
        container: { backgroundColor: isTodaySelected ? Colors.primary : '#22C55E', borderRadius: 16 },
        text: { color: '#FFFFFF', fontWeight: '700' },
      },
    };
  }

  return (
    <FadeInView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(true); }} />}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={22} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Job Schedule</Text>
            <Text style={styles.subtitle}>Track inspections and assigned work</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {['all', 'inspection', 'work'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All' : f === 'inspection' ? 'Inspections' : 'Work'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Inspection</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Work</Text>
          </View>
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            markingType="custom"
            markedDates={markedWithSelected}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: Colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: Colors.primary,
              monthTextColor: Colors.primaryDark,
              indicatorColor: Colors.primary,
            }}
          />
        </View>

        <Text style={styles.scheduleTitle}>
          Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>

        {sortedSelectedBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No events scheduled for this day.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {sortedSelectedBookings.map((b) => {
              const isInspection = b.eventType === 'inspection';
              const eventTime = isInspection
                ? (b.inspection?.scheduledTime || '09:00')
                : new Date(b.schedule.scheduledStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={`${b._id}-${b.eventType}`} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, isInspection ? { backgroundColor: '#FEF3C7' } : { backgroundColor: '#DBEAFE' }]}>
                      <Ionicons name={isInspection ? "search" : "construct"} size={14} color={isInspection ? "#D97706" : "#2563EB"} style={{ marginRight: 4 }} />
                      <Text style={[styles.badgeText, isInspection ? { color: '#D97706' } : { color: '#2563EB' }]}>
                        {isInspection ? "Inspection" : "Work"}
                      </Text>
                    </View>
                    <Text style={styles.timeText}>{eventTime}</Text>
                  </View>
                  <Text style={styles.categoryText}>{b.category?.name || 'Service'}</Text>
                  <Text style={styles.addressText} numberOfLines={1}>{b.address}</Text>
                  <Text style={styles.viewBtn} onPress={() => router.push(`/(provider)/job/${b._id}`)}>View Details</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20, paddingTop: 56 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  filterTextActive: { color: '#FFF' },
  legendRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  calendarWrapper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFF', elevation: 2, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 20 },
  scheduleTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#9CA3AF', fontSize: 15, marginTop: 12 },
  listContainer: { paddingBottom: 30 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  timeText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  categoryText: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  viewBtn: { color: Colors.primary, fontSize: 14, fontWeight: '600' }
});
