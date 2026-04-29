import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { FadeInView } from '../../src/theme/animations';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Alert, ActivityIndicator } from 'react-native';
import { changePassword } from '../../src/api/residentEndPoints';

export default function ResidentSettings() {
  const [passData, setPassData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loadingPassword, setLoadingPassword] = React.useState(false);

  const handlePasswordChange = async () => {
    if (!passData.currentPassword || !passData.newPassword || !passData.confirmPassword) {
      return Alert.alert('Error', 'Please fill all password fields');
    }
    if (passData.newPassword !== passData.confirmPassword) {
      return Alert.alert('Error', 'New passwords do not match');
    }
    try {
      setLoadingPassword(true);
      await changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      Alert.alert('Success', 'Password updated successfully');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <FadeInView>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Password</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed" size={22} color={Colors.textSecondary} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="key" size={20} color={Colors.textLight} />
          </View>
          <View style={styles.passwordForm}>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Current Password"
              value={passData.currentPassword}
              onChangeText={(value) => setPassData((prev) => ({ ...prev, currentPassword: value }))}
            />
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="New Password"
              value={passData.newPassword}
              onChangeText={(value) => setPassData((prev) => ({ ...prev, newPassword: value }))}
            />
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Confirm New Password"
              value={passData.confirmPassword}
              onChangeText={(value) => setPassData((prev) => ({ ...prev, confirmPassword: value }))}
            />
            <TouchableOpacity style={styles.updateBtn} onPress={handlePasswordChange} disabled={loadingPassword}>
              {loadingPassword ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.updateBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 24, marginTop: 40 },
  section: { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8, marginTop: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 16, color: Colors.text },
  passwordForm: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    color: Colors.text,
  },
  updateBtn: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  updateBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
