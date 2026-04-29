import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, updateUserProfile, changePassword } from '../../src/api/residentEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

const InputField = ({ icon, label, value, onChangeText, required, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label} {required && <Text style={{ color: Colors.danger }}>*</Text>}
    </Text>
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color={Colors.textLight} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={Colors.textLight}
        {...props}
      />
    </View>
  </View>
);

export default function ResidentEditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      const data = res.data.data;
      setName(data.full_name || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setCity(data.city || '');
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateUserProfile({ full_name: name, phone, address, city });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required'); return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match'); return;
    }
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters'); return;
    }
    setPwError('');
    setPwSuccess('');
    setPwLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 56 }}
        >
          {/* Header */}
          <View style={styles.pageHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={styles.pageTitle}>Edit Profile</Text>
              <Text style={styles.pageSubtitle}>Update your personal information</Text>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </LinearGradient>
          </View>

          {/* Profile Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>

            {error ? (
              <View style={styles.alertBox}>
                <Ionicons name="close-circle" size={16} color={Colors.danger} />
                <Text style={[styles.alertText, { color: Colors.danger }]}>{error}</Text>
              </View>
            ) : null}
            {success ? (
              <View style={[styles.alertBox, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={[styles.alertText, { color: Colors.successDark }]}>{success}</Text>
              </View>
            ) : null}

            <InputField
              icon="person-outline"
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              required
            />
            <InputField
              icon="call-outline"
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="03XXXXXXXXX"
              keyboardType="phone-pad"
            />
            <InputField
              icon="location-outline"
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="House #123, Street 4"
            />
            <InputField
              icon="business-outline"
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Enter your city"
            />

            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              <LinearGradient
                colors={saving ? ['#9CA3AF', '#9CA3AF'] : [Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="save" size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Change Password */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="lock-closed" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Change Password</Text>
            </View>

            {pwError ? (
              <View style={styles.alertBox}>
                <Ionicons name="close-circle" size={16} color={Colors.danger} />
                <Text style={[styles.alertText, { color: Colors.danger }]}>{pwError}</Text>
              </View>
            ) : null}
            {pwSuccess ? (
              <View style={[styles.alertBox, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={[styles.alertText, { color: Colors.successDark }]}>{pwSuccess}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPw}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.textLight}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPw}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.textLight}
                />
                <TouchableOpacity onPress={() => setShowNewPw(!showNewPw)}>
                  <Ionicons name={showNewPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>

            <TouchableOpacity onPress={handleChangePassword} disabled={pwLoading} activeOpacity={0.8}>
              <LinearGradient
                colors={pwLoading ? ['#9CA3AF', '#9CA3AF'] : ['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                {pwLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="key" size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>Change Password</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarGradient: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16,
    ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  alertBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 10, padding: 12, marginBottom: 14,
  },
  alertText: { fontSize: 13, flex: 1 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 6,
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
