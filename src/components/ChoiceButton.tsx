import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";

type Props = {
  label: string;
  subtitle?: string;
  variant?: "primary" | "secondary";
  onPress: () => void;
  disabled?: boolean;
};

export const ChoiceButton: React.FC<Props> = ({
  label,
  subtitle,
  variant = "primary",
  onPress,
  disabled = false,
}) => {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          isPrimary ? styles.textPrimary : styles.textSecondary,
          disabled && styles.textDisabled,
        ]}
      >
        {label}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            isPrimary ? styles.subtitlePrimary : styles.subtitleSecondary,
            disabled && styles.subtitleDisabled,
          ]}
        >
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.glowCyan,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.border,
    shadowColor: "transparent",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 17,
    fontWeight: "800",
  },
  textPrimary: {
    color: colors.textInverse,
  },
  textSecondary: {
    color: colors.text,
  },
  textDisabled: {
    color: colors.textMuted,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  subtitlePrimary: {
    color: "rgba(11, 17, 32, 0.8)",
  },
  subtitleSecondary: {
    color: colors.textSecondary,
  },
  subtitleDisabled: {
    color: colors.textMuted,
  },
});
