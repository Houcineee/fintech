// Dark immersive theme with neon accents
export const colors = {
  // Base - Deep dark navy
  background: "#0B1120",
  surface: "#151D2E",
  surfaceHighlight: "#1E293B",

  // Action colors - Neon electric
  primary: "#00E5FF",      // Electric cyan
  primaryDim: "#00E5FF20", // 12% opacity for backgrounds
  success: "#00FF88",      // Neon green (money)
  successDim: "#00FF8820",
  danger: "#FF2E6C",       // Hot pink-red
  dangerDim: "#FF2E6C20",
  warning: "#FFB800",      // Amber gold
  warningDim: "#FFB80020",
  purple: "#A78BFA",       // Soft purple for ethical
  purpleDim: "#A78BFA20",

  // Text
  text: "#E8EDF5",         // Bright white
  textSecondary: "#6B7A99", // Muted blue-gray
  textMuted: "#475569",    // Very muted
  textInverse: "#0B1120",  // Dark for light backgrounds

  // Borders
  border: "#1E293B",
  borderHighlight: "#334155",

  // Status
  locked: "#1E293B",
  lockedText: "#475569",
};

// Glow shadows for neon effect
export const shadows = {
  sm: {
    shadowColor: "rgba(0, 229, 255, 0.08)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  md: {
    shadowColor: "rgba(0, 229, 255, 0.12)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  lg: {
    shadowColor: "rgba(0, 229, 255, 0.2)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 12,
  },
  // Colored glows
  glowCyan: {
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  glowGreen: {
    shadowColor: "#00FF88",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  glowAmber: {
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  glowPink: {
    shadowColor: "#FF2E6C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
};
