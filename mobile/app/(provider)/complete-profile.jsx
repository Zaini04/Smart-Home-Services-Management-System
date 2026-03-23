import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { completeProfile, getCategoriesWithSkills } from '../../src/api/serviceProviderEndPoints';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Shadows } from '../../src/theme/colors';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [images, setImages] = useState({ profile: null, cnicFront: null, cnicBack: null });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getCategoriesWithSkills();
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: field === 'profile',
      aspect: field === 'profile' ? [1, 1] : [4, 3],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setImages(prev => ({ ...prev, [field]: result.assets[0] }));
    }
  };

  const currentCategoryObj = categories.find(c => c._id === selectedCategory);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return setError('Please select a category');
    if (selectedSkills.length === 0) return setError('Please select at least one skill');
    if (!images.profile || !images.cnicFront || !images.cnicBack) return setError('Please upload all required images');

    try {
      setSubmitting(true);
      setError('');
      
      const formData = new FormData();
      formData.append('categoryId', selectedCategory);
      formData.append('skills', JSON.stringify(selectedSkills));
      
      const appendImage = (field, img) => {
        const name = img.uri.split('/').pop();
        const ext = name.split('.').pop();
        formData.append(field, {
          uri: img.uri,
          name: name || `${field}.${ext}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      };
      
      appendImage('profileImage', images.profile);
      appendImage('cnicFront', images.cnicFront);
      appendImage('cnicBack', images.cnicBack);

      await completeProfile(formData);
      router.replace('/(provider)/kyc-status');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit profile');
    } finally {
      setSubmitting(false);
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
      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.header}>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <Text style={styles.headerSubtitle}>Follow the steps to get verified</Text>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={20} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Categories */}
        <Text style={styles.sectionTitle}>1. Select Category</Text>
        <View style={styles.grid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.catItem, selectedCategory === cat._id && styles.catItemActive]}
              onPress={() => { setSelectedCategory(cat._id); setSelectedSkills([]); }}
            >
              <Text style={[styles.catText, selectedCategory === cat._id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Skills */}
        {currentCategoryObj && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>2. Select Skills</Text>
            <View style={styles.grid}>
              {currentCategoryObj.skills.map((skill, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.skillItem, selectedSkills.includes(skill) && styles.skillItemActive]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[styles.skillText, selectedSkills.includes(skill) && styles.skillTextActive]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Images */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>3. Upload Documents</Text>
        
        <View style={styles.uploadRow}>
          <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('profile')}>
            {images.profile ? (
              <Image source={{ uri: images.profile.uri }} style={styles.uploadImg} />
            ) : (
              <>
                <Ionicons name="person-circle-outline" size={32} color={Colors.textLight} />
                <Text style={styles.uploadLabel}>Profile Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.uploadRow}>
          <TouchableOpacity style={[styles.uploadBox, { flex: 1, height: 100 }]} onPress={() => pickImage('cnicFront')}>
            {images.cnicFront ? (
              <Image source={{ uri: images.cnicFront.uri }} style={styles.uploadImg} />
            ) : (
              <>
                <Ionicons name="card-outline" size={28} color={Colors.textLight} />
                <Text style={styles.uploadLabel}>CNIC Front</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.uploadBox, { flex: 1, height: 100 }]} onPress={() => pickImage('cnicBack')}>
            {images.cnicBack ? (
              <Image source={{ uri: images.cnicBack.uri }} style={styles.uploadImg} />
            ) : (
              <>
                <Ionicons name="card-outline" size={28} color={Colors.textLight} />
                <Text style={styles.uploadLabel}>CNIC Back</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Submit Application</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scrollContent: { padding: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerLight, padding: 12, borderRadius: 10, marginBottom: 20 },
  errorText: { color: Colors.danger, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FFF' },
  catItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 14, color: Colors.text },
  catTextActive: { color: '#FFF', fontWeight: '600' },
  skillItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent' },
  skillItemActive: { backgroundColor: '#EFF6FF', borderColor: Colors.primary },
  skillText: { fontSize: 13, color: Colors.textSecondary },
  skillTextActive: { color: Colors.primary, fontWeight: '600' },
  uploadRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  uploadBox: { height: 120, width: 120, alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadImg: { width: '100%', height: '100%' },
  uploadLabel: { fontSize: 12, color: Colors.textLight, marginTop: 4 },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 30 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
