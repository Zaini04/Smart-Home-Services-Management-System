import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, TextInput, ActivityIndicator, Alert, Dimensions,
  Platform, KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import {
  getProviderProfile, updateProviderProfile, getCategoriesWithSkills
} from '../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';
import { BASE_URL } from '../../src/api/apiInstance';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const providerUserId = user?._id || user?.user_id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [categoriesData, setCategoriesData] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Form State
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [cnic, setCnic] = useState('');
  const [experience, setExperience] = useState('');
  const [visitPrice, setVisitPrice] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Selections
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Images
  const [profileImage, setProfileImage] = useState(null);
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);

  // Existing URLs
  const [existingProfile, setExistingProfile] = useState('');
  const [existingCnicFront, setExistingCnicFront] = useState('');
  const [existingCnicBack, setExistingCnicBack] = useState('');

  const [kycMessage, setKycMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (!providerUserId) {
        Alert.alert('Error', 'User session not found. Please login again.');
        return;
      }
      const [catRes, profileRes] = await Promise.all([
        getCategoriesWithSkills(),
        getProviderProfile(providerUserId)
      ]);

      const categories = catRes.data?.data || [];
      setCategoriesData(categories);

      const profile = profileRes.data?.data;
      if (profile) {
        setAge(profile.age?.toString() || '');
        setBio(profile.description || '');
        setCnic(profile.cnic || '');
        setExperience(profile.experience?.toString() || '');
        setVisitPrice(profile.visitPrice?.toString() || '');
        setHourlyRate(profile.hourlyRate?.toString() || '');

        setExistingProfile(profile.profileImage || '');
        setExistingCnicFront(profile.cnicFrontImage || '');
        setExistingCnicBack(profile.cnicBackImage || '');

        if (profile.kycStatus === 'rejected') {
          setKycMessage(profile.kycMessage || 'Your profile was rejected. Please update your information.');
        }

        const catIds = (profile.serviceCategories || []).map(c => c._id || c);
        setSelectedCategories(catIds);

        const relevant = categories.filter(c => catIds.includes(c._id));
        const skills = relevant.flatMap(c => c.subCategories || []);
        setAvailableSkills(skills);

        const skillIds = (profile.skills || []).map(s => s._id || s);
        setSelectedSkills(skillIds);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id) => {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter(c => c !== id)
      : [...selectedCategories, id];
    
    setSelectedCategories(next);

    const relevant = categoriesData.filter(c => next.includes(c._id));
    const skills = relevant.flatMap(c => c.subCategories || []);
    setAvailableSkills(skills);
    
    setSelectedSkills(prev => prev.filter(sk => skills.some(s => s._id === sk)));
  };

  const toggleSkill = (id) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const pickImage = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setter(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategories.length) return Alert.alert('Error', 'Please select at least one category.');
    if (!selectedSkills.length) return Alert.alert('Error', 'Please select at least one skill.');

    try {
      setSaving(true);
      const fd = new FormData();
      
      fd.append('age', age);
      fd.append('description', bio);
      fd.append('cnic', cnic);
      fd.append('experience', experience);
      fd.append('visitPrice', visitPrice);
      fd.append('hourlyRate', hourlyRate);
      fd.append('serviceCategories', JSON.stringify(selectedCategories));
      fd.append('skills', JSON.stringify(selectedSkills));

      if (profileImage) {
        fd.append('profileImage', {
          uri: platformURI(profileImage.uri),
          name: profileImage.fileName || 'profile.jpg',
          type: profileImage.mimeType || 'image/jpeg'
        });
      }
      if (cnicFront) {
        fd.append('cnicFront', {
          uri: platformURI(cnicFront.uri),
          name: cnicFront.fileName || 'front.jpg',
          type: cnicFront.mimeType || 'image/jpeg'
        });
      }
      if (cnicBack) {
        fd.append('cnicBack', {
          uri: platformURI(cnicBack.uri),
          name: cnicBack.fileName || 'back.jpg',
          type: cnicBack.mimeType || 'image/jpeg'
        });
      }

      await updateProviderProfile(providerUserId, fd);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(provider)/complete-profile') }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const platformURI = (uri) => Platform.OS === 'android' ? uri : uri.replace('file://', '');

  const renderImageSlot = (title, file, existing, setter) => (
    <View style={styles.imgSlot}>
      <Text style={styles.imgSlotTitle}>{title}</Text>
      <TouchableOpacity 
        style={styles.imgUploadBox} 
        onPress={() => pickImage(setter)}
        activeOpacity={0.7}
      >
        {file ? (
          <Image source={{ uri: file.uri }} style={styles.imgFull} />
        ) : existing ? (
          <Image source={{ uri: `${BASE_URL}${existing}` }} style={styles.imgFull} />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Ionicons name="camera" size={32} color={Colors.textLight} />
            <Text style={styles.imgPlaceholderText}>Upload New</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 20}
      style={styles.container}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
      
      {kycMessage ? (
        <View style={styles.alertBox}>
          <Ionicons name="warning" size={24} color="#DC2626" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Admin Feedback</Text>
            <Text style={styles.alertText}>{kycMessage}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Photo</Text>
        {renderImageSlot('Your Photo', profileImage, existingProfile, setProfileImage)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
        <TextInput style={styles.input} placeholder="CNIC Number (XXXXX-XXXXXXX-X)" value={cnic} onChangeText={setCnic} />
        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="About You / Bio" multiline value={bio} onChangeText={setBio} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience & Pricing</Text>
        <TextInput style={styles.input} placeholder="Years of Experience" keyboardType="numeric" value={experience} onChangeText={setExperience} />
        <TextInput style={styles.input} placeholder="Visit Price (PKR)" keyboardType="numeric" value={visitPrice} onChangeText={setVisitPrice} />
        <TextInput style={styles.input} placeholder="Hourly Rate (PKR)" keyboardType="numeric" value={hourlyRate} onChangeText={setHourlyRate} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories & Skills</Text>
        <Text style={styles.subText}>Categories:</Text>
        <View style={styles.chipRow}>
          {categoriesData.map(cat => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.chip, selectedCategories.includes(cat._id) && styles.chipActive]}
              onPress={() => toggleCategory(cat._id)}
            >
              <Text style={[styles.chipText, selectedCategories.includes(cat._id) && styles.chipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {availableSkills.length > 0 && (
          <>
            <Text style={[styles.subText, { marginTop: 12 }]}>Skills:</Text>
            <View style={styles.chipRow}>
              {availableSkills.map(skill => (
                <TouchableOpacity
                  key={skill._id}
                  style={[styles.chip, selectedSkills.includes(skill._id) && styles.chipActive]}
                  onPress={() => toggleSkill(skill._id)}
                >
                  <Text style={[styles.chipText, selectedSkills.includes(skill._id) && styles.chipTextActive]}>{skill.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity Documents</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>{renderImageSlot('CNIC Front', cnicFront, existingCnicFront, setCnicFront)}</View>
          <View style={{ flex: 1 }}>{renderImageSlot('CNIC Back', cnicBack, existingCnicBack, setCnicBack)}</View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save & Resubmit</Text>}
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  alertBox: { flexDirection: 'row', gap: 12, backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, marginBottom: 20 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 4 },
  alertText: { fontSize: 13, color: '#DC2626', lineHeight: 20 },
  section: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  subText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#FFF' },
  imgSlot: { marginBottom: 16, alignItems: 'center' },
  imgSlotTitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  imgUploadBox: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: Colors.borderLight, borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imgFull: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgPlaceholder: { alignItems: 'center' },
  imgPlaceholderText: { fontSize: 11, color: Colors.textLight, marginTop: 4 },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', ...Shadows.medium },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
