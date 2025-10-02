// Theme configuration for the app
export const theme = {
  colors: {
    // Background colors
    background: '#F8FAFC',        // Main background color (slate-50)
    backgroundSecondary: '#F1F5F9', // Secondary background (slate-100)
    backgroundTertiary: '#E2E8F0',  // Tertiary background (slate-200)
    
    // Primary colors (keeping the existing blue theme)
    primary: '#2E86AB',           // Main blue color
    primaryLight: '#3B9BC8',      // Lighter blue
    primaryDark: '#1E5F7A',       // Darker blue
    
    // Text colors
    text: {
      primary: '#0F172A',         // Dark text (slate-900)
      secondary: '#475569',       // Medium text (slate-600)
      tertiary: '#64748B',        // Light text (slate-500)
      inverse: '#FFFFFF',         // White text for dark backgrounds
    },
    
    // Status colors
    success: '#10B981',           // Green for success states
    warning: '#F59E0B',           // Orange for warnings
    error: '#EF4444',             // Red for errors
    info: '#3B82F6',              // Blue for info
    
    // UI elements
    border: '#CBD5E1',            // Border color (slate-300)
    shadow: '#00000010',          // Shadow color with opacity
    card: '#FFFFFF',              // Card background
    overlay: '#00000080',         // Overlay background
    
    // Button colors
    button: {
      primary: '#2E86AB',
      primaryHover: '#1E5F7A',
      secondary: '#E2E8F0',
      secondaryText: '#475569',
      disabled: '#94A3B8',
    },
    
    // Timer colors (for practice tests)
    timer: {
      safe: '#10B981',            // Green
      warning: '#F59E0B',         // Orange
      danger: '#EF4444',          // Red
    }
  },
  
  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Typography
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      title: 28,
      heading: 32,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }
  }
};

// Helper function to get theme colors
export const getThemeColor = (colorPath) => {
  const keys = colorPath.split('.');
  let color = theme.colors;
  
  for (const key of keys) {
    color = color[key];
    if (!color) return null;
  }
  
  return color;
};

export default theme;
