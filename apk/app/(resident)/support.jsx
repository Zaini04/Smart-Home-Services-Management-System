import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/api/apiInstance';

export default function HelpAndSupportResident() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    
    setLoading(true);
    try {
      await api.post('/support', { subject, message, type: 'Support' });
      Alert.alert('Success', 'Your support request has been submitted. Our team will get back to you soon.');
      setSubject('');
      setMessage('');
    } catch (e) {
      Alert.alert('Error', 'Could not send request. Please try again.');
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 20}
      style={styles.container}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 64 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>Help & Support</Text>
      
      <View style={styles.infoCard}>
        <Ionicons name="help-buoy" size={40} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.infoTitle}>How can we help you?</Text>
        <Text style={styles.infoText}>
          If you have any questions, encounter a problem, or just want to leave feedback, 
          please write to us below. Our support team is available 24/7.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Subject</Text>
        <TextInput 
          style={styles.input} 
          placeholder="What is this regarding?" 
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.inputLabel}>Message</Text>
        <TextInput 
          style={[styles.input, { height: 120 }]} 
          multiline 
          textAlignVertical="top" 
          placeholder="Describe your issue or question in detail..." 
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.actionBtn} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : (
              <>
                <Ionicons name="send" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Submit Request</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 24, marginTop: 40 },
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 },
  infoTitle: { fontSize: 18, fontWeight: '700', color: Colors.primaryDark, marginBottom: 8 },
  infoText: { fontSize: 14, color: '#1E40AF', textAlign: 'center', lineHeight: 22 },
  formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, shadowColor: Colors.text, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16, backgroundColor: '#F9FAFB' },
  actionBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
