// ServiceHub Color Palette — matches web client's blue/indigo gradient theme
export const Colors = {
  primary: '#2563EB',       // blue-600
  primaryDark: '#1D4ED8',   // blue-700
  secondary: '#4F46E5',     // indigo-600
  secondaryDark: '#4338CA', // indigo-700
  accent: '#06B6D4',        // cyan-500
  
  success: '#22C55E',       // green-500
  successLight: '#DCFCE7',  // green-100
  successDark: '#15803D',   // green-700
  
  warning: '#F59E0B',       // amber-500
  warningLight: '#FEF3C7',  // amber-100
  warningDark: '#B45309',   // amber-700
  
  danger: '#EF4444',        // red-500
  dangerLight: '#FEE2E2',   // red-100
  dangerDark: '#B91C1C',    // red-700
  
  purple: '#9333EA',
  purpleLight: '#F3E8FF',
  
  white: '#FFFFFF',
  background: '#F8FAFC',    // slate-50
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#1F2937',          // gray-800
  textSecondary: '#6B7280', // gray-500
  textLight: '#9CA3AF',     // gray-400
  textMuted: '#D1D5DB',     // gray-300
  
  border: '#E5E7EB',        // gray-200
  borderLight: '#F3F4F6',   // gray-100
  
  gradientStart: '#2563EB',  // blue-600
  gradientEnd: '#4F46E5',    // indigo-600
  
  overlay: 'rgba(0,0,0,0.5)',
  
  star: '#FBBF24',          // yellow-400
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const Fonts = {
  regular: { fontSize: 14, color: '#1F2937' },
  small: { fontSize: 12, color: '#6B7280' },
  tiny: { fontSize: 10, color: '#9CA3AF' },
  h1: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  h2: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  h3: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  button: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
};
