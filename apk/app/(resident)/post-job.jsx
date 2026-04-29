import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, ActivityIndicator, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleUseLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to auto-fill your address.',
          [{ text: 'OK' }]
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setCoords({ lat: latitude, lng: longitude });

      // Reverse geocode using Nominatim (free, no API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'HomeFixApp/1.0' } }
      );
      const data = await response.json();
      if (data?.display_name) {
        // Extract a clean address from the result
        const addr = data.address;
        const parts = [
          addr?.house_number,
          addr?.road || addr?.street,
          addr?.neighbourhood || addr?.suburb,
          addr?.city || addr?.town || addr?.village,
          addr?.state,
        ].filter(Boolean);
        setAddress(parts.join(', '));
      }
    } catch (err) {
      Alert.alert('Location Error', 'Could not fetch your location. Please enter manually.');
    } finally {
      setLocationLoading(false);
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
    if (loading) return;
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
      if (coords) {
        formData.append('lat', String(coords.lat));
        formData.append('lng', String(coords.lng));
      }

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
      router.replace('/(resident)/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

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
          contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 64 }}
        >
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
            placeholder="Example: My ceiling fan is making noise and sparking..."
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
          <Text style={styles.helperText}>Upload up to 5 photos of the problem</Text>
        </View>

        {/* Location / Address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Your Address</Text>
            <Text style={{ color: Colors.danger }}>*</Text>
          </View>

          {/* GPS Button */}
          <TouchableOpacity
            style={styles.gpsBtn}
            onPress={handleUseLocation}
            disabled={locationLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={locationLoading ? ['#9CA3AF', '#9CA3AF'] : ['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.gpsBtnGradient}
            >
              {locationLoading ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.gpsBtnText}>Getting location...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="navigate" size={16} color="#FFF" />
                  <Text style={styles.gpsBtnText}>Use My Current Location</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {coords && (
            <View style={styles.coordBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.coordText}>
                GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </Text>
            </View>
          )}

          <Text style={[styles.cardTitle, { fontSize: 13, fontWeight: '500', marginTop: 10, marginBottom: 6, color: Colors.text }]}>
            Or enter manually:
          </Text>
          <TextInput
            style={styles.textarea}
            value={address}
            onChangeText={setAddress}
            placeholder="House/Flat #, Street, Area, City..."
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', marginBottom: 24 },
  headerIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
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
  gpsBtn: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  gpsBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 16 },
  gpsBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  coordBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, backgroundColor: '#F0FDF4', borderRadius: 8, padding: 8 },
  coordText: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14, marginTop: 6 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
