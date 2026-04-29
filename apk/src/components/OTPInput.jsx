import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function OTPInput({ value, onChangeText, length = 4 }) {
  const [internalCode, setInternalCode] = useState(value || '');
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    let newCode = internalCode.split('');
    newCode[index] = text;
    const finalCode = newCode.join('');
    setInternalCode(finalCode);
    onChangeText(finalCode);

    // Auto focus next
    if (text && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !internalCode[index] && index > 0) {
      // Auto focus previous
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            internalCode[index] && styles.inputFilled
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={internalCode[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.text,
  },
  inputFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  }
});
