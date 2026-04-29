// Claymorphism Light Theme - Playful & Kid-Friendly
export const colors = {
  // Base - Warm cream background
  background: "#FFF8F0",
  surface: "#FFFFFF",
  surfaceRaised: "#F5F0EB",
  surfaceHighlight: "#EDE8E3",

  // Action colors - Soft & Friendly
  primary: "#4F9CF7",        // Friendly blue
  primaryDim: "#DBEAFE",     // Light blue background
  primaryLight: "#EFF6FF",   // Very light blue
  
  success: "#34D399",        // Soft green (trust)
  successDim: "#D1FAE5",
  successLight: "#ECFDF5",
  
  warning: "#F59E0B",        // Warm gold (money)
  warningDim: "#FEF3C7",
  warningLight: "#FFFBEB",
  
  danger: "#EF4444",         // Soft red
  dangerDim: "#FEE2E2",
  dangerLight: "#FEF2F2",
  
  barakah: "#C084FC",        // Light purple (barakah)
  barakahDim: "#F3E8FF",
  barakahLight: "#FAF5FF",

  // Text
  text: "#1E1B4B",           // Dark indigo (primary)
  textSecondary: "#6B7280",  // Gray
  textMuted: "#9CA3AF",      // Lighter gray
  textInverse: "#FFFFFF",    // White

  // Borders
  border: "#E5E7EB",
  borderHighlight: "#D1D5DB",

  // Status
  locked: "#F3F4F6",
  lockedText: "#9CA3AF",
};

// Claymorphism shadows - Double shadow technique
export const shadows = {
  // Outer drop shadow (lifts element up)
  clay: {
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  // Pressed state (concave, inner shadow feel)
  clayPressed: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  // Large elements
  clayLarge: {
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  // Primary accent glow
  clayPrimary: {
    shadowColor: "#4F9CF7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // Success glow
  claySuccess: {
    shadowColor: "#34D399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // Warning glow
  clayWarning: {
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};