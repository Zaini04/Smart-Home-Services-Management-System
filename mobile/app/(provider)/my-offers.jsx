import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyOffers } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

export default function MyOffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await getMyOffers();
      setOffers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { color: '#F59E0B', bg: '#FEF3C7', icon: 'time' };
      case 'accepted': return { color: '#22C55E', bg: '#DCFCE7', icon: 'checkmark-circle' };
      case 'rejected': return { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle' };
      default: return { color: Colors.textLight, bg: '#F3F4F6', icon: 'help-circle' };
    }
  };

  const renderItem = ({ item }) => {
    const styleObj = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.offerCard}
        onPress={() => router.push(`/(provider)/job/${item.booking}`)}
        activeOpacity={0.7}
      >
        <View style={styles.offerHeader}>
          <View style={styles.catBox}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle} numberOfLines={1}>Job Request</Text>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: styleObj.bg }]}>
            <Ionicons name={styleObj.icon} size={12} color={styleObj.color} />
            <Text style={[styles.statusText, { color: styleObj.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.estimateBox}>
          <Text style={styles.estimateLabel}>Estimated Labor Cost</Text>
          <Text style={styles.estimateValue}>Rs. {item.laborEstimate.toLocaleString()}</Text>
        </View>

        {item.message && (
          <View style={styles.messageBox}>
            <Ionicons name="chatbox-ellipses-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* List */}
      <FlatList
        data={offers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOffers(); }} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Offers Sent</Text>
              <Text style={styles.emptyText}>Find jobs and place offers to get hired.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  offerCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  catBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  jobTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  dateText: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  estimateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 12 },
  estimateLabel: { fontSize: 13, color: Colors.textSecondary },
  estimateValue: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  messageBox: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  messageText: { fontSize: 13, color: Colors.textSecondary, flex: 1, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
});
