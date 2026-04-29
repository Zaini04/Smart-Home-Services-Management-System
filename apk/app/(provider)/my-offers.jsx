import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyOffers, sendOrUpdateOffer } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import { calculateCommission } from '../../src/utils/commissionCalc';

export default function MyOffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [updateLabor, setUpdateLabor] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleUpdatePress = (offer) => {
    setSelectedOffer(offer);
    setUpdateLabor(offer.laborEstimate?.toString() || '');
    setUpdateMessage(offer.message || '');
  };

  const handleSubmitUpdate = async () => {
    if (!updateLabor) return Alert.alert("Error", "Please enter a labor estimate.");
    if (isNaN(updateLabor) || Number(updateLabor) <= 0) return Alert.alert("Error", "Please enter a valid amount.");
    
    setIsSubmitting(true);
    try {
      const bookingId = selectedOffer.booking?._id || selectedOffer.booking;
      await sendOrUpdateOffer(bookingId, {
        laborEstimate: Number(updateLabor),
        message: updateMessage
      });
      Alert.alert("Success", "Your offer has been updated!");
      setSelectedOffer(null);
      fetchOffers();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }) => {
    const styleObj = getStatusStyle(item.status);
    return (
      <View
        style={styles.offerCard}
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
          <Text style={styles.estimateValue}>Rs. {(item.laborEstimate || 0).toLocaleString()}</Text>
        </View>

        {item.message && (
          <View style={styles.messageBox}>
            <Ionicons name="chatbox-ellipses-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        {item.status === 'accepted' && (
          <TouchableOpacity 
            style={styles.viewJobBtn}
            onPress={() => router.push(`/(provider)/job/${item.booking?._id || item.booking}`)}
          >
            <Ionicons name="eye" size={16} color="#FFF" />
            <Text style={styles.viewJobBtnText}>View Job Details</Text>
          </TouchableOpacity>
        )}

        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.viewJobBtn, { backgroundColor: Colors.primary }]}
            onPress={() => handleUpdatePress(item)}
          >
            <Ionicons name="create" size={16} color="#FFF" />
            <Text style={styles.viewJobBtnText}>Update Offer</Text>
          </TouchableOpacity>
        )}
      </View>
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

      {/* Update Offer Modal */}
      <Modal visible={!!selectedOffer} animationType="fade" transparent={true} onRequestClose={() => setSelectedOffer(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Offer</Text>
                <TouchableOpacity onPress={() => setSelectedOffer(null)}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.inputLabel}>Your Labor Estimate (Rs.)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1500"
                  keyboardType="numeric"
                  value={updateLabor}
                  onChangeText={setUpdateLabor}
                />

                <Text style={styles.inputLabel}>Message to Resident (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Explain why you are the best fit..."
                  multiline
                  numberOfLines={4}
                  value={updateMessage}
                  onChangeText={setUpdateMessage}
                  textAlignVertical="top"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
                  onPress={handleSubmitUpdate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                     <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Update Offer</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  messageBox: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginBottom: 8 },
  messageText: { fontSize: 13, color: Colors.textSecondary, flex: 1, fontStyle: 'italic' },
  viewJobBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.success, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  viewJobBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { width: '100%', maxHeight: '90%' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text, marginBottom: 20 },
  textArea: { height: 100 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
