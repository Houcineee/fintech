import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";

// Simple badge for achievements in results
type BadgeProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  earned: boolean;
};

export const Badge: React.FC<BadgeProps> = ({ icon, label, earned }) => {
  return (
    <View style={styles.badgeWrapper}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: earned ? colors.success : colors.surfaceHighlight,
            borderWidth: earned ? 0 : 1,
            borderColor: colors.border,
          },
          earned && shadows.glowGreen,
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={earned ? colors.textInverse : colors.textMuted}
        />
      </View>
      <Text
        style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}
      >
        {label}
      </Text>
    </View>
  );
};

// Star rating display with neon stars
type StarRatingProps = {
  rating: number; // 0-5
  maxStars?: number;
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
}) => {
  return (
    <View style={styles.starsContainer}>
      {[...Array(maxStars)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.starWrapper,
            i < rating && styles.starActive,
          ]}
        >
          <Ionicons
            name={i < rating ? "star" : "star-outline"}
            size={36}
            color={i < rating ? colors.warning : colors.borderHighlight}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeWrapper: {
    alignItems: "center",
    gap: spacing.xs,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  badgeLabelLocked: {
    color: colors.textMuted,
  },
  starsContainer: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  starWrapper: {
    padding: 4,
  },
  starActive: {
    ...shadows.glowAmber,
  },
});
