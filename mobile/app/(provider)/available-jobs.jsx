import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvailableBookings, sendOrUpdateOffer } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import { calculateCommission } from '../../src/utils/commissionCalc';

export default function AvailableJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [canSendOffers, setCanSendOffers] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [providerStats, setProviderStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [laborCost, setLaborCost] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getAvailableBookings();
      setJobs(res.data.data.bookings || []);
      setCanSendOffers(res.data.data.canSendOffers || false);
      setWalletBalance(res.data.data.walletBalance || 0);
      setProviderStats(res.data.data.provider || {});
    } catch (err) {
      console.error("FETCH ERROR:", err.message);
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSendOfferPress = (job) => {
    if (!canSendOffers) {
      Alert.alert(
        "Low Wallet Balance",
        `Your wallet balance is Rs. ${walletBalance}. You need at least Rs. 2000 to send offers. Please top up your wallet.`,
        [{ text: "Top Up Wallet", onPress: () => router.push('/(provider)/wallet') }, { text: "Cancel", style: "cancel" }]
      );
      return;
    }
    setSelectedJob(job);
    setLaborCost('');
    setMessage('');
  };

  const handleSubmitOffer = async () => {
    if (!laborCost) return Alert.alert("Error", "Please enter a labor estimate.");
    if (isNaN(laborCost) || Number(laborCost) <= 0) return Alert.alert("Error", "Please enter a valid amount.");
    
    setIsSubmitting(true);
    try {
      await sendOrUpdateOffer(selectedJob._id, {
        laborEstimate: Number(laborCost),
        message: message
      });
      Alert.alert("Success", "Your offer has been sent successfully!");
      setSelectedJob(null);
      fetchJobs(); // Refresh jobs to reflect any changes
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to send offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderJobCard = ({ item }) => (
    <View style={styles.jobCard}>
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
      
      <Text style={styles.jobDesc}>{item.description}</Text>
      
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.locationText} numberOfLines={2}>{item.address}</Text>
      </View>
      
      <View style={styles.actionRow}>
        <Text style={styles.offersCount}>{item.offers?.length || 0} Offers placed</Text>
        <TouchableOpacity 
          style={styles.offerBtn} 
          onPress={() => handleSendOfferPress(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.offerBtnText}>Send Offer</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const commData = laborCost ? calculateCommission(Number(laborCost), providerStats?.completedJobs || 0) : null;

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

      {/* Offer Modal */}
      <Modal visible={!!selectedJob} animationType="fade" transparent={true} onRequestClose={() => setSelectedJob(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Send Offer</Text>
                <TouchableOpacity onPress={() => setSelectedJob(null)}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {selectedJob && (
                  <View style={styles.jobPreviewCard}>
                    <Text style={styles.jobPreviewTitle}>{selectedJob.category?.name}</Text>
                    <Text style={styles.jobPreviewDesc} numberOfLines={2}>{selectedJob.description}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Your Labor Estimate (Rs.)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1500"
                  keyboardType="numeric"
                  value={laborCost}
                  onChangeText={setLaborCost}
                />

                {commData && (
                  <View style={styles.commissionBox}>
                    <View style={styles.commRow}>
                      <Text style={styles.commLabel}>Commission Rate</Text>
                      <Text style={styles.commValue}>{commData.ratePercent}</Text>
                    </View>
                    <View style={styles.commRow}>
                      <Text style={styles.commLabel}>Platform Fee</Text>
                      <Text style={styles.commValue}>- Rs. {commData.finalCommission}</Text>
                    </View>
                    <View style={[styles.commRow, styles.commRowTotal]}>
                      <Text style={styles.commLabelBold}>You will receive</Text>
                      <Text style={styles.commValueBold}>Rs. {commData.providerKeeps}</Text>
                    </View>
                    {commData.isNewProvider && (
                      <Text style={styles.newProviderText}>✨ You get a 50% discount on commission as a new worker!</Text>
                    )}
                  </View>
                )}

                <Text style={styles.inputLabel}>Message to Resident (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Explain why you are the best fit..."
                  multiline
                  numberOfLines={4}
                  value={message}
                  onChangeText={setMessage}
                  textAlignVertical="top"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
                  onPress={handleSubmitOffer}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                     <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Offer</Text>
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
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  locationText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  offersCount: { fontSize: 13, fontWeight: '500', color: Colors.textLight },
  offerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  offerBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { width: '100%', maxHeight: '90%' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  jobPreviewCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: Colors.borderLight },
  jobPreviewTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  jobPreviewDesc: { fontSize: 13, color: Colors.textSecondary },
  inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text, marginBottom: 20 },
  textArea: { height: 100 },
  commissionBox: { backgroundColor: '#F0FDFA', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#CCFBF1' },
  commRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  commRowTotal: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#99F6E4' },
  commLabel: { fontSize: 13, color: '#0F766E' },
  commValue: { fontSize: 13, color: '#0F766E', fontWeight: '600' },
  commLabelBold: { fontSize: 14, fontWeight: '700', color: '#115E59' },
  commValueBold: { fontSize: 16, fontWeight: '800', color: '#115E59' },
  newProviderText: { fontSize: 11, color: Colors.primary, marginTop: 8, fontWeight: '600' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
