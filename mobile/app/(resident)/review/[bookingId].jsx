import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { submitReview } from '../../../src/api/residentEndPoints';
import { Colors, Shadows } from '../../../src/theme/colors';

export default function SubmitReviewScreen() {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Error', 'Please select a rating'); return; }
    if (!review.trim()) { Alert.alert('Error', 'Please write a review'); return; }

    try {
      setLoading(true);
      await submitReview(bookingId, { rating, review: review.trim() });
      Alert.alert('Success', 'Review submitted!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 56 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
          <Text style={styles.backText}>Write Review</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.title}>How was the service?</Text>
          <Text style={styles.subtitle}>Your feedback helps others find great providers</Text>

          {/* Star Rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Ionicons
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={i <= rating ? '#F59E0B' : Colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </Text>

          {/* Review Text */}
          <TextInput
            style={styles.textarea}
            value={review}
            onChangeText={setReview}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            <LinearGradient
              colors={loading ? ['#D1D5DB', '#D1D5DB'] : ['#F59E0B', '#D97706']}
              style={styles.submitBtn}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFF" />
                  <Text style={styles.submitText}>Submit Review</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', ...Shadows.medium },
  headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  ratingLabel: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 24 },
  textarea: { width: '100%', borderWidth: 2, borderColor: Colors.border, borderRadius: 14, padding: 14, fontSize: 14, color: Colors.text, minHeight: 120, marginBottom: 20 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, width: '100%' },
  submitText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
