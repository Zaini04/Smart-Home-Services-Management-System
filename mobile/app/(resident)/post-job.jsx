import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import { getCategories, createBooking } from '../../src/api/residentEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

export default function PostJobScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const pickImage = async () => {
    if (images.length >= 5) { setError('Maximum 5 images'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets]);
      setError('');
    }
  };

  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!selectedCategory) { setError('Please select a category'); return; }
    if (!description.trim()) { setError('Please describe your problem'); return; }
    if (!address.trim()) { setError('Please enter your address'); return; }

    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('category', selectedCategory._id);
      formData.append('description', description.trim());
      formData.append('address', address.trim());

      images.forEach((img, i) => {
        const name = img.uri.split('/').pop();
        const ext = name.split('.').pop();
        formData.append('images', {
          uri: img.uri,
          name: name || `photo_${i}.${ext}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      });

      await createBooking(formData);
      setSuccess(true);
      setTimeout(() => router.push('/(resident)/my-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Job Posted! 🎉</Text>
          <Text style={styles.successText}>Workers will start sending their offers soon.</Text>
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          <Text style={{ color: Colors.primary, fontSize: 13, marginTop: 8 }}>Redirecting to My Bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 50 }}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.headerIcon}>
            <Ionicons name="paper-plane" size={24} color="#FFF" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Post a Job</Text>
          <Text style={styles.headerSubtitle}>Describe your problem and get offers from workers</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="close-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Category */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Select Category</Text>
            <Text style={{ color: Colors.danger }}>*</Text>
          </View>
          {categoriesLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 30 }} />
          ) : (
            <View style={styles.catGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.catCard, selectedCategory?._id === cat._id && styles.catCardActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <View style={[styles.catInitial, selectedCategory?._id === cat._id && { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.catInitialText, selectedCategory?._id === cat._id && { color: Colors.primary }]}>
                      {cat.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.catName, selectedCategory?._id === cat._id && { color: Colors.primary }]} numberOfLines={2}>
                    {cat.name}
                  </Text>
                  {selectedCategory?._id === cat._id && (
                    <View style={styles.catCheck}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="create" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Describe Your Problem</Text>
            <Text style={{ color: Colors.danger }}>*</Text>
          </View>
          <TextInput
            style={styles.textarea}
            value={description}
            onChangeText={setDescription}
            placeholder="Example: My ceiling fan is making noise..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Add Photos</Text>
            <Text style={styles.optionalText}>(Optional)</Text>
          </View>
          <View style={styles.imageRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumb}>
                <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                  <Ionicons name="close" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Ionicons name="camera" size={22} color={Colors.textLight} />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.helperText}>Upload up to 5 photos</Text>
        </View>

        {/* Address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Your Address</Text>
            <Text style={{ color: Colors.danger }}>*</Text>
          </View>
          <TextInput
            style={styles.textarea}
            value={address}
            onChangeText={setAddress}
            placeholder="House/Flat number, Street, Area, City..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          <LinearGradient
            colors={loading ? ['#D1D5DB', '#D1D5DB'] : [Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Ionicons name="paper-plane" size={20} color="#FFF" />
                <Text style={styles.submitText}>Post Job</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 20 },
  successCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 32, alignItems: 'center', ...Shadows.medium },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.successLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  successText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  headerIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  optionalText: { fontSize: 12, color: Colors.textLight },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: { width: '30%', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center' },
  catCardActive: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  catInitial: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catInitialText: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  catName: { fontSize: 11, fontWeight: '500', color: Colors.text, textAlign: 'center' },
  catCheck: { position: 'absolute', top: 4, right: 4 },
  textarea: { borderWidth: 2, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.text, minHeight: 80 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageThumb: { width: 70, height: 70, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  thumbImage: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },
  addImageBtn: {
    width: 70, height: 70, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  addImageText: { fontSize: 10, fontWeight: '600', color: Colors.textLight, marginTop: 2 },
  helperText: { fontSize: 11, color: Colors.textLight, marginTop: 8 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14, marginTop: 6 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
