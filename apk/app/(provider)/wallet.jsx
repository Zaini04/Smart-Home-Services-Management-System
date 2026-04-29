import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Dimensions, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProviderWallet, topUpWallet, withdrawFromWallet } from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WalletScreen() {
  const router = useRouter();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('jazzcash');
  const [accountNumber, setAccountNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await getProviderWallet();
      setWallet(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleTopUp = async () => {
    if (!amount || Number(amount) <= 0) return Alert.alert('Error', 'Enter a valid amount');
    try {
      setActionLoading(true);
      await topUpWallet({ amount: Number(amount), method });
      setShowTopUp(false);
      setAmount('');
      Alert.alert('Success', `Rs. ${Number(amount).toLocaleString()} added to wallet!`);
      fetchWallet();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Top-up failed');
    } finally { setActionLoading(false); }
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) return Alert.alert('Error', 'Enter a valid amount');
    try {
      setActionLoading(true);
      await withdrawFromWallet({ amount: Number(amount), method, accountNumber });
      setShowWithdraw(false);
      setAmount('');
      setAccountNumber('');
      Alert.alert('Success', `Rs. ${Number(amount).toLocaleString()} withdrawal successful!`);
      fetchWallet();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Withdrawal failed');
    } finally { setActionLoading(false); }
  };

  const renderTransaction = ({ item }) => {
    const isCredit = item.type === 'credit';
    return (
      <View style={styles.txCard}>
        <View style={[styles.txIconBox, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
          <Ionicons name={isCredit ? 'arrow-down' : 'arrow-up'} size={18} color={isCredit ? '#16A34A' : '#DC2626'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.txTitle}>{item.description}</Text>
          <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.txAmount, { color: isCredit ? '#16A34A' : '#DC2626' }]}>
            {isCredit ? '+' : '-'}Rs. {item.amount.toLocaleString()}
          </Text>
          <Text style={styles.txStatus}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={wallet?.transactions || []}
          keyExtractor={(item) => item._id}
          renderItem={renderTransaction}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWallet(); }} />}
          ListHeaderComponent={
            <>
              {/* Balance Card */}
              <LinearGradient colors={['#1E3A8A', '#2563EB', '#4F46E5']} style={styles.balanceCard}>
                <View style={styles.balanceTop}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Ionicons name="wallet-outline" size={24} color="rgba(255,255,255,0.8)" />
                </View>
                <Text style={styles.balanceAmount}>Rs. {(wallet?.balance || 0).toLocaleString()}</Text>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => { setShowTopUp(true); setAmount(''); }}>
                    <Ionicons name="add" size={16} color={Colors.primary} />
                    <Text style={styles.btnPrimaryText}>Top Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => { setShowWithdraw(true); setAmount(''); setAccountNumber(''); }}>
                    <Ionicons name="arrow-down" size={16} color="#FFF" />
                    <Text style={styles.btnSecondaryText}>Withdraw</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Transactions Title */}
              <View style={styles.txHeader}>
                <Text style={styles.txHeaderTitle}>Recent Transactions</Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptyText}>You haven&apos;t made any transactions yet.</Text>
            </View>
          }
        />
      )}

      {/* Top Up Modal */}
      <Modal visible={showTopUp} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money</Text>
              <TouchableOpacity onPress={() => setShowTopUp(false)}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Amount (Rs.)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 5000"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.modalLabel}>Method</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {['jazzcash', 'easypaisa', 'test'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                  onPress={() => setMethod(m)}
                >
                  <Text style={[styles.methodBtnText, method === m && styles.methodBtnTextActive]}>
                    {m === 'test' ? 'Test' : m === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.modalSubmit, actionLoading && { opacity: 0.7 }]} 
              onPress={handleTopUp} 
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubmitText}>Add Rs. {Number(amount || 0).toLocaleString()}</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdraw} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setShowWithdraw(false)}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 16 }}>
              Available: <Text style={{ fontWeight: '700', color: '#16A34A' }}>Rs. {(wallet?.availableBalance || 0).toLocaleString()}</Text>
            </Text>

            <Text style={styles.modalLabel}>Amount (Rs.)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 2000"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.modalLabel}>Withdraw To</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {['jazzcash', 'easypaisa', 'bank'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                  onPress={() => setMethod(m)}
                >
                  <Text style={[styles.methodBtnText, method === m && styles.methodBtnTextActive, { textTransform: 'capitalize' }]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Account Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="03XX-XXXXXXX"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <TouchableOpacity 
              style={[styles.modalSubmit, { backgroundColor: Colors.primary }, actionLoading && { opacity: 0.7 }]} 
              onPress={handleWithdraw} 
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubmitText}>Withdraw</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  balanceCard: { borderRadius: 20, padding: 24, marginBottom: 24, ...Shadows.medium },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: '#FFF', marginBottom: 24 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 12 },
  btnPrimaryText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  btnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, borderRadius: 12 },
  btnSecondaryText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  txHeader: { marginBottom: 16 },
  txHeaderTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  txCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  txIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  txDate: { fontSize: 12, color: Colors.textSecondary },
  txAmount: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  txStatus: { fontSize: 11, color: Colors.textLight, textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginTop: 12 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  modalLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, marginBottom: 8 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16 },
  methodBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center' },
  methodBtnActive: { backgroundColor: '#EFF6FF', borderColor: Colors.primary },
  methodBtnText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  methodBtnTextActive: { color: Colors.primary, fontWeight: '700' },
  modalSubmit: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  modalSubmitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
