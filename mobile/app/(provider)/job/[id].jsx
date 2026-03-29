import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, RefreshControl, Linking, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getJobDetails, sendOrUpdateOffer, requestInspection, completeInspection,
  sendFinalPrice, verifyStartOTP, startWork, completeWork,
  updatePriceDuringWork, updateSchedule, providerCancelJob,
  respondToCounterFee,
} from '../../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../../src/theme/colors';

const statusConfig = {
  open: { color: '#3B82F6', bg: '#EFF6FF', label: 'Open', icon: 'time' },
  provider_selected: { color: '#059669', bg: '#D1FAE5', label: 'Assigned', icon: 'star' },
  inspection_requested: { color: '#D97706', bg: '#FEF3C7', label: 'Inspection Requested', icon: 'time' },
  inspection_approved: { color: '#EA580C', bg: '#FFEDD5', label: 'Inspection Approved', icon: 'checkmark-circle' },
  offer_accepted: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offer Accepted', icon: 'checkmark-circle' },
  inspection_pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Pending', icon: 'time' },
  inspection_scheduled: { color: '#F97316', bg: '#FFF7ED', label: 'Inspection Scheduled', icon: 'calendar' },
  awaiting_price_approval: { color: '#D97706', bg: '#FFFBEB', label: 'Awaiting Price Approval', icon: 'time' },
  price_approved: { color: '#14B8A6', bg: '#F0FDFA', label: 'Price Approved', icon: 'checkmark-circle' },
  work_in_progress: { color: '#6366F1', bg: '#EEF2FF', label: 'Work in Progress', icon: 'construct' },
  completed: { color: '#22C55E', bg: '#DCFCE7', label: 'Completed', icon: 'checkmark-done-circle' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: 'close-circle' },
};

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [offerLabor, setOfferLabor] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [otp, setOtp] = useState('');
  const [finalLabor, setFinalLabor] = useState('');
  const [finalMaterial, setFinalMaterial] = useState('');

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await getJobDetails(id);
      setJob(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handleAction = async (action, fn, ...args) => {
    setActionLoading(action);
    try {
      await fn(...args);
      Alert.alert('Success', `${action} successful`);
      fetchJob();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || `${action} failed`);
    } finally {
      setActionLoading('');
    }
  };

  // Inspection form states
  const [inspFee, setInspFee] = useState('');
  const [inspMsg, setInspMsg] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspTime, setInspTime] = useState('');

  const [updatePriceLabor, setUpdatePriceLabor] = useState('');
  const [updatePriceMaterial, setUpdatePriceMaterial] = useState('');
  const [updatePriceMsg, setUpdatePriceMsg] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState('2');
  const [scheduleUnit, setScheduleUnit] = useState('hours');

  const [updateScheduleDate, setUpdateScheduleDate] = useState('');
  const [updateScheduleDuration, setUpdateScheduleDuration] = useState('');
  const [updateScheduleUnit, setUpdateScheduleUnit] = useState('hours');

  const [cancelReason, setCancelReason] = useState('');

  // Native Picker config
  const [pickerConfig, setPickerConfig] = useState({ visible: false, mode: 'date', field: '' });
  const [tempDate, setTempDate] = useState(new Date());

  const openPicker = (field, mode) => setPickerConfig({ visible: true, mode, field });

  const onPickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setPickerConfig({ ...pickerConfig, visible: false });
    }
    if (selectedDate) {
        setTempDate(selectedDate);
        if (pickerConfig.mode === 'date') {
            const dateStr = selectedDate.toISOString().split('T')[0];
            if (pickerConfig.field === 'inspDate') setInspDate(dateStr);
            if (pickerConfig.field === 'scheduleDate') setScheduleDate(dateStr);
            if (pickerConfig.field === 'updateScheduleDate') setUpdateScheduleDate(dateStr);
        } else {
            // mode = time
            const timeStr = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (pickerConfig.field === 'inspTime') setInspTime(timeStr);
        }
    }
  };

  const onSendOffer = () => {
    if (!offerLabor) return Alert.alert('Validation Error', 'Enter labor estimate');
    handleAction('Send Offer', sendOrUpdateOffer, id, {
      laborEstimate: Number(offerLabor),
      message: offerMsg,
    });
  };

  const onVerifyOTP = () => {
    if (!otp) return Alert.alert('Validation Error', 'Enter OTP');
    handleAction('Verify OTP', verifyStartOTP, id, { otp });
  };

  const onRequestInspection = () => {
    if (!inspFee) return Alert.alert('Validation Error', 'Enter inspection fee');
    if (!inspDate) return Alert.alert('Validation Error', 'Enter inspection expected date');
    handleAction('Request Inspection', requestInspection, id, {
      fee: Number(inspFee),
      message: inspMsg,
      scheduledDate: inspDate,
      scheduledTime: inspTime,
    });
  };

  const onSendPrice = () => {
    if (!finalLabor) return Alert.alert('Validation Error', 'Enter final labor cost');
    if (!scheduleDate || !scheduleDuration) return Alert.alert('Validation Error', 'Enter schedule exact start date and duration');
    const data = {
      laborCost: Number(finalLabor),
      materialCost: Number(finalMaterial) || 0,
      totalAmount: Number(finalLabor) + (Number(finalMaterial) || 0),
      scheduledStartDate: scheduleDate,
      estimatedDurationValue: Number(scheduleDuration) || 2,
      estimatedDurationUnit: scheduleUnit || 'hours',
    };
    handleAction('Send Final Price', sendFinalPrice, id, data);
  };

  const onCompleteInspectionPrice = () => {
    if (!finalLabor) return Alert.alert('Validation Error', 'Enter final labor cost');
    if (!scheduleDate || !scheduleDuration) return Alert.alert('Validation Error', 'Enter schedule exact start date and duration');
    const data = {
      laborCost: Number(finalLabor),
      materialCost: Number(finalMaterial) || 0,
      totalAmount: Number(finalLabor) + (Number(finalMaterial) || 0),
      scheduledStartDate: scheduleDate,
      estimatedDurationValue: Number(scheduleDuration) || 2,
      estimatedDurationUnit: scheduleUnit || 'hours',
    };
    handleAction('Complete Inspection', completeInspection, id, data);
  };

  const onUpdatePrice = () => {
    if (!updatePriceLabor) return Alert.alert('Validation Error', 'Enter updated labor cost');
    handleAction('Update Price', updatePriceDuringWork, id, {
      laborCost: Number(updatePriceLabor),
      reason: updatePriceMsg,
    });
  };

  const onUpdateSchedule = () => {
    if (!updateScheduleDate || !updateScheduleDuration) return Alert.alert('Validation Error', 'Enter schedule start date and duration');
    handleAction('Update Schedule', updateSchedule, id, { 
      scheduledStartDate: updateScheduleDate,
      estimatedDurationValue: Number(updateScheduleDuration) || 2,
      estimatedDurationUnit: updateScheduleUnit || 'hours',
    });
  };

  const onCancelJob = () => {
    Alert.alert('Cancel Job', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes', style: 'destructive',
        onPress: () => handleAction('Cancel Job', providerCancelJob, id, { reason: cancelReason || 'Provider cancelled' }),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.textSecondary }}>Job not found</Text>
      </View>
    );
  }

  const conf = statusConfig[job.status] || statusConfig.open;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 56 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJob(); }} />}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
          <Text style={styles.backText}>Job Details</Text>
        </TouchableOpacity>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: conf.color }]}>
          <View style={[styles.statusBadge, { backgroundColor: conf.bg }]}>
            <Ionicons name={conf.icon} size={16} color={conf.color} />
            <Text style={[styles.statusBadgeText, { color: conf.color }]}>{conf.label}</Text>
          </View>
        </View>

        {/* Description + Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Description</Text>
          <Text style={styles.cardText}>{job.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="folder-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{job.category?.name || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textLight} />
            <Text style={[styles.metaText, { flex: 1 }]}>{job.address || 'N/A'}</Text>
          </View>
          {/* Get Directions Button */}
          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={() => {
              const addr = encodeURIComponent(job.address || '');
              const lat = job.lat;
              const lng = job.lng;
              let url;
              if (lat && lng) {
                url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
              } else {
                url = `https://www.google.com/maps/search/?api=1&query=${addr}`;
              }
              Linking.openURL(url).catch(() =>
                Alert.alert('Error', 'Could not open Google Maps')
              );
            }}
          >
            <Ionicons name="navigate" size={16} color="#FFF" />
            <Text style={styles.directionsBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Customer Info */}
        {job.status !== 'open' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Details</Text>
            <View style={styles.providerRow}>
              <View style={styles.providerAvatar}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{job.resident?.name || 'Customer'}</Text>
                <Text style={styles.providerDetail}>{job.resident?.phone || ''}</Text>
              </View>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push(`/chat/${job._id}`)}
              >
                <Ionicons name="chatbubble" size={16} color={Colors.primary} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Price Info */}
        {job.finalPrice?.totalAmount > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price Details</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>Rs. {(job.finalPrice?.totalAmount || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceSub}>Labor Cost</Text>
              <Text style={styles.priceSub}>Rs. {(job.finalPrice?.laborCost || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceSub}>Material Cost</Text>
              <Text style={styles.priceSub}>Rs. {(job.finalPrice?.materialCost || 0).toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Actions based on Status */}
        <View style={styles.actionsCard}>
          
          {/* OPEN: Send Offer */}
          {job.status === 'open' && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Submit Offer</Text>
              <Text style={styles.inputLabel}>Labor Estimate (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={offerLabor} onChangeText={setOfferLabor} placeholder="e.g. 1500" />
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" value={offerMsg} onChangeText={setOfferMsg} placeholder="Optional message..." />
              
              <TouchableOpacity style={styles.actionBtn} onPress={onSendOffer} disabled={!!actionLoading}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                  <Ionicons name="paper-plane" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Send Offer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* OTP Verification */}
          {(job.status === 'offer_accepted' || job.status === 'inspection_scheduled') && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Verify Start OTP</Text>
              <Text style={styles.inputLabel}>Enter OTP from customer</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={otp} onChangeText={setOtp} placeholder="e.g. 123456" />
              <TouchableOpacity style={styles.actionBtn} onPress={onVerifyOTP} disabled={!!actionLoading}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                  <Ionicons name="key" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Verify OTP & Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Request Inspection (when offer accepted or selected) */}
          {(job.status === 'provider_selected' || job.status === 'offer_accepted') && !job.inspection?.requested && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Request Inspection</Text>
              <Text style={styles.inputLabel}>Inspection Fee (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={inspFee} onChangeText={setInspFee} placeholder="e.g. 500" />
              
              <Text style={styles.inputLabel}>Expected Date</Text>
              <TouchableOpacity onPress={() => openPicker('inspDate', 'date')} style={styles.pickerBtn}>
                 <Text style={[styles.pickerBtnText, !inspDate && styles.pickerBtnPlaceholder]}>{inspDate || 'Select Date'}</Text>
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Expected Time (Optional)</Text>
              <TouchableOpacity onPress={() => openPicker('inspTime', 'time')} style={styles.pickerBtn}>
                 <Text style={[styles.pickerBtnText, !inspTime && styles.pickerBtnPlaceholder]}>{inspTime || 'Select Time'}</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Reason (Optional)</Text>
              <TextInput style={[styles.input, { height: 70 }]} multiline textAlignVertical="top" value={inspMsg} onChangeText={setInspMsg} placeholder="Explain why inspection is needed..." />
              <TouchableOpacity style={styles.actionBtn} onPress={onRequestInspection} disabled={!!actionLoading}>
                <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                  <Ionicons name="search" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Request Inspection</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Inspection Requested / Counter Offered */}
          {job.status === 'inspection_requested' && (
            <View style={[styles.formCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Ionicons name="time" size={32} color="#F59E0B" style={{ alignSelf: 'center', marginBottom: 10 }} />
              <Text style={[styles.formTitle, { textAlign: 'center', color: '#D97706' }]}>Waiting for Resident</Text>
              <Text style={{ textAlign: 'center', fontSize: 13, color: '#B45309', marginBottom: 14 }}>
                {job.inspection?.status === 'counter_offered'
                  ? `Resident countered with Rs. ${job.inspection.counterFee}. Accept or re-propose.`
                  : `Inspection fee: Rs. ${(job.inspection?.fee || 0).toLocaleString()}. Waiting for approval.`}
              </Text>

              {job.inspection?.status === 'counter_offered' && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.success, paddingVertical: 12, alignItems: 'center', borderRadius: 10 }]}
                    onPress={() => handleAction('Accept Counter', respondToCounterFee, id, { action: 'accept', fee: job.inspection.counterFee })}
                    disabled={!!actionLoading}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Accept Rs. {job.inspection.counterFee}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.primary, paddingVertical: 12, alignItems: 'center', borderRadius: 10 }]}
                     onPress={() => {
                        Alert.prompt('Re-propose Fee', 'Enter new fee', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Submit', onPress: (val) => handleAction('Re-propose', respondToCounterFee, id, { action: 're_propose', fee: Number(val) }) }
                        ], 'plain-text', '', 'numeric');
                     }}
                     disabled={!!actionLoading}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Re-propose</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* AWAITING PRICE / INSPECTION APPROVED */}
          {(['inspection_pending', 'inspection_approved'].includes(job.status) || (!job.finalPrice?.totalAmount && ['offer_accepted', 'inspection_scheduled', 'provider_selected'].includes(job.status))) && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{job.status === 'inspection_approved' ? 'Complete Inspection & Send Price' : 'Send Final Price & Schedule'}</Text>
              <Text style={styles.inputLabel}>Final Labor Cost (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={finalLabor} onChangeText={setFinalLabor} placeholder="e.g. 1500" />
              <Text style={styles.inputLabel}>Material Cost (Rs. - Optional)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={finalMaterial} onChangeText={setFinalMaterial} placeholder="e.g. 500" />
              
              <Text style={styles.inputLabel}>Schedule Start</Text>
              <TouchableOpacity onPress={() => openPicker('scheduleDate', 'date')} style={styles.pickerBtn}>
                 <Text style={[styles.pickerBtnText, !scheduleDate && styles.pickerBtnPlaceholder]}>{scheduleDate || 'Select Start Date'}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Estimate</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={scheduleDuration} onChangeText={setScheduleDuration} placeholder="2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput style={styles.input} value={scheduleUnit} onChangeText={setScheduleUnit} placeholder="hours/days" />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={job.status === 'inspection_approved' ? onCompleteInspectionPrice : onSendPrice} 
                disabled={!!actionLoading}
              >
                <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                  <Ionicons name="cash" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Send Price to Customer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* START WORK */}
          {job.status === 'price_approved' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Start Work', startWork, id)} disabled={!!actionLoading}>
              <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                <Ionicons name="play" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Start Work Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* COMPLETE WORK */}
          {job.status === 'work_in_progress' && (
            <>
              {job.otp?.complete?.code && (
                <View style={[styles.formCard, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
                  <Text style={[styles.formTitle, { color: '#115E59' }]}>Job Complete Signal</Text>
                  <Text style={{ fontSize: 13, color: '#0F766E', marginBottom: 12 }}>
                    If you are done with the work, show this OTP to the Resident to collect payment.
                  </Text>
                  <View style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#99F6E4', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: 8, color: '#0D9488' }}>
                      {job.otp.complete.code}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Complete Work', completeWork, id)} disabled={!!actionLoading}>
                <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                  <Ionicons name="checkmark-done" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Mark Job Completed</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Update Price During Work */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Request Price Revision</Text>
                <Text style={styles.inputLabel}>New Labor Cost (Rs.)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={updatePriceLabor} onChangeText={setUpdatePriceLabor} placeholder="e.g. 2000" />
                <Text style={styles.inputLabel}>Reason</Text>
                <TextInput style={[styles.input, { height: 60 }]} multiline textAlignVertical="top" value={updatePriceMsg} onChangeText={setUpdatePriceMsg} placeholder="Explain why price increased..." />
                <TouchableOpacity style={styles.actionBtn} onPress={onUpdatePrice} disabled={!!actionLoading}>
                  <LinearGradient colors={['#F97316', '#EA580C']} style={styles.actionGradient}>
                    <Ionicons name="cash" size={18} color="#FFF" />
                    <Text style={styles.actionBtnText}>Request Price Revision</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Update Schedule During Work */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Request Schedule Change</Text>
                <Text style={styles.inputLabel}>New Start Date</Text>
                <TouchableOpacity onPress={() => openPicker('updateScheduleDate', 'date')} style={styles.pickerBtn}>
                   <Text style={[styles.pickerBtnText, !updateScheduleDate && styles.pickerBtnPlaceholder]}>{updateScheduleDate || 'Select New Date'}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Duration</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={updateScheduleDuration} onChangeText={setUpdateScheduleDuration} placeholder="2" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Unit (hours/days)</Text>
                    <TextInput style={styles.input} value={updateScheduleUnit} onChangeText={setUpdateScheduleUnit} placeholder="hours" />
                  </View>
                </View>
                <TouchableOpacity style={styles.actionBtn} onPress={onUpdateSchedule} disabled={!!actionLoading}>
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                    <Ionicons name="calendar" size={18} color="#FFF" />
                    <Text style={styles.actionBtnText}>Request Schedule Extension</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Cancel Job */}
          {!['completed', 'cancelled'].includes(job.status) && (
            <TouchableOpacity style={styles.actionBtn} onPress={onCancelJob} disabled={!!actionLoading}>
              <View style={[styles.actionGradient, { backgroundColor: Colors.dangerLight }]}>
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
                <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Cancel Job</Text>
              </View>
            </TouchableOpacity>
          )}

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {pickerConfig.visible && (
        <DateTimePicker
          value={tempDate}
          mode={pickerConfig.mode}
          is24Hour={false}
          display="default"
          onChange={onPickerChange}
        />
      )}
      {Platform.OS === 'ios' && pickerConfig.visible && (
         <TouchableOpacity 
            style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderColor: '#EEE' }}
            onPress={() => setPickerConfig({ ...pickerConfig, visible: false })}
         >
             <Text style={{ textAlign: 'center', color: Colors.primary, fontWeight: '700', fontSize: 16 }}>Done</Text>
         </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16, marginTop: 14, alignSelf: 'flex-start',
  },
  directionsBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statusCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, ...Shadows.small, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.borderLight },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  cardText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  providerAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  providerName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  providerDetail: { fontSize: 12, color: Colors.textSecondary },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  chatBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  priceValue: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  priceSub: { fontSize: 13, color: Colors.textSecondary },
  actionsCard: { gap: 10, marginTop: 4 },
  formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16, backgroundColor: '#F9FAFB' },
  pickerBtn: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#F9FAFB', justifyContent: 'center' },
  pickerBtnText: { fontSize: 14, color: Colors.text },
  pickerBtnPlaceholder: { color: Colors.textLight },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
