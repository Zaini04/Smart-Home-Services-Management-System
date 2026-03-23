import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvailableBookings } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

export default function AvailableJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getAvailableBookings();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const renderJobCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/(provider)/job/${item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.jobHeader}>
        <View style={styles.catBox}>
          <Ionicons name="construct" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.catName}>{item.category?.name}</Text>
          <Text style={styles.timePosted}>Posted {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.matchBadge}>
          <Text style={styles.matchText}>Skill Match</Text>
        </LinearGradient>
      </View>
      
      <Text style={styles.jobDesc} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.locationText} numberOfLines={1}>{item.address}</Text>
      </View>
      
      <View style={styles.actionRow}>
        <Text style={styles.offersCount}>{item.offers?.length || 0} Offers placed</Text>
        <View style={styles.offerBtn}>
          <Text style={styles.offerBtnText}>Send Offer</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Jobs</Text>
        <Text style={styles.headerSubtitle}>Jobs matching your verified skills</Text>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="search" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Jobs Currently Available</Text>
              <Text style={styles.emptyText}>We&apos;ll notify you when a resident posts a job matching your skills.</Text>
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
  jobCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  jobHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  catBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  timePosted: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  matchBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  matchText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  jobDesc: { fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  locationText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  offersCount: { fontSize: 13, fontWeight: '500', color: Colors.textLight },
  offerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  offerBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
});
